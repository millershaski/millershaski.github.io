import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/services.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  runApp(const MainApp());
}

class MainApp extends StatelessWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark(useMaterial3: true),
      home: const GameScreen(),
    );
  }
}

// The game runs on a virtual pixel grid this many pixels wide; height follows the screen.
const double virtualWidth = 180;

const double shipHalfWidth = 5.5;
const double shipHeight = 11;
const double shipHitRadius = 4.5;

const shipSprite = [
  '     B     ',
  '    BWB    ',
  '    BWB    ',
  '   BBCBB   ',
  '   BBCBB   ',
  '  DBBBBBD  ',
  ' DDBBBBBDD ',
  'DDDBBBBBDDD',
  'DR DBBBD RD',
  'D  DDDDD  D',
  '    RRR    ',
];

const shipPalette = <String, Color>{
  'B': Color(0xFF4FC3F7),
  'D': Color(0xFF0277BD),
  'W': Color(0xFFFFFFFF),
  'C': Color(0xFFB3E5FC),
  'R': Color(0xFFE53935),
};

const rockPalette = <String, Color>{
  '1': Color(0xFFB5A090),
  '2': Color(0xFF8D7B6B),
  '3': Color(0xFF5C4B3F),
  '4': Color(0xFF4A3B30),
};

class Asteroid {
  Asteroid._(this.x, this.y, this.radius, this.sprite);

  factory Asteroid.create(math.Random rng, double x, double y, int radius) {
    final d = 2 * radius + 1;
    final edge = List.generate(
      16,
      (_) => radius * (0.8 + rng.nextDouble() * 0.3) + 0.4,
    );
    final grid = List.generate(d, (_) => List.filled(d, ' '));
    for (var i = 0; i < d; i++) {
      for (var j = 0; j < d; j++) {
        final dx = j - radius;
        final dy = i - radius;
        final sector =
            ((math.atan2(dy, dx) + math.pi) / (2 * math.pi) * 16).floor() % 16;
        if (math.sqrt(dx * dx + dy * dy) > edge[sector]) continue;
        final light = -(dx + dy) / (radius * 1.4);
        grid[i][j] = light > 0.35 ? '1' : (light < -0.3 ? '3' : '2');
      }
    }
    if (radius >= 4) {
      for (var k = 0; k < 3; k++) {
        final i = radius + rng.nextInt(radius) - radius ~/ 2;
        final j = radius + rng.nextInt(radius) - radius ~/ 2;
        if (grid[i][j] != ' ') grid[i][j] = '4';
      }
    }
    return Asteroid._(x, y, radius, grid.map((r) => r.join()).toList());
  }

  double x;
  double y;
  final int radius;
  final List<String> sprite;
}

class Bullet {
  Bullet(this.x, this.y);

  final double x;
  double y;
}

enum Ability {
  gun('GUN', Colors.limeAccent),
  shield('SHIELD', Colors.cyanAccent),
  emp('EMP', Colors.purpleAccent);

  const Ability(this.label, this.color);

  final String label;
  final Color color;
}

const double shieldDuration = 1;
const double shieldRechargeTime = 5;
const double shieldRadius = 9;
const double empCooldownTime = 10;
const double empFlashTime = 0.45;

const double ufoHalfWidth = 6.5;
const double ufoHalfHeight = 3.5;
const int ufoCoins = 3;

const ufoSprite = [
  '    DDDDD    ',
  '   DGGGGGD   ',
  '  MMMMMMMMM  ',
  ' MMLMMLMMLMM ',
  'MMMMMMMMMMMMM',
  ' DDDDDDDDDDD ',
  '   D     D   ',
];

const ufoPalette = <String, Color>{
  'D': Color(0xFF546E7A),
  'G': Color(0xFF80CBC4),
  'M': Color(0xFFB0BEC5),
};

class Ufo {
  Ufo(this.x, this.fireTimer);

  double x;
  double y = -10;
  double baseY = -10;
  double targetY = 20;
  double vx = 0;
  double wanderTimer = 0;
  double fireTimer;
  double age = 0;
  double hitFlash = 0;
  int hp = 3;
}

class EnemyShot {
  EnemyShot(this.x, this.y, this.vx, this.vy);

  double x;
  double y;
  final double vx;
  final double vy;
}

class Star {
  Star(this.x, this.y, this.depth);

  final double x;
  double y;
  final double depth;
}

class GameModel extends ChangeNotifier {
  final math.Random _rng = math.Random();
  final List<Asteroid> asteroids = [];
  final List<Bullet> bullets = [];
  final List<Ufo> ufos = [];
  final List<EnemyShot> shots = [];
  final List<Star> stars = [];

  Size size = Size.zero;
  double scale = 1; // screen px per virtual pixel
  double vh = 0; // virtual height
  double shipX = virtualWidth / 2;
  double elapsed = 0;
  double score = 0;
  bool isOver = false;
  double _spawnTimer = 0;
  double _ufoSpawnTimer = 8;

  int coins = 0;
  Ability selected = Ability.gun;
  double shieldActive = 0; // seconds of shield left
  double shieldRecharge = 0; // seconds until the shield is ready again
  double empCooldown = 0;
  double empFlash = 0;
  double empOriginX = 0;

  bool get shieldReady => shieldActive <= 0 && shieldRecharge <= 0;
  bool get empReady => empCooldown <= 0;

  // 0..1 fill for the ability buttons.
  double progressOf(Ability a) => switch (a) {
    Ability.gun => 1,
    Ability.shield =>
      shieldActive > 0
          ? shieldActive / shieldDuration
          : 1 - shieldRecharge / shieldRechargeTime,
    Ability.emp => 1 - empCooldown / empCooldownTime,
  };

  double get shipTop => vh - 30;
  double get shipCenterY => shipTop + shipHeight / 2;

  void setSize(Size newSize) {
    if (newSize == size) return;
    size = newSize;
    scale = newSize.width / virtualWidth;
    vh = newSize.height / scale;
    if (stars.isEmpty) {
      for (var i = 0; i < 70; i++) {
        stars.add(
          Star(
            _rng.nextDouble() * virtualWidth,
            _rng.nextDouble() * vh,
            0.2 + _rng.nextDouble() * 0.8,
          ),
        );
      }
    }
  }

  void restart() {
    asteroids.clear();
    bullets.clear();
    ufos.clear();
    shots.clear();
    elapsed = 0;
    score = 0;
    _spawnTimer = 0;
    _ufoSpawnTimer = 8;
    shieldActive = 0;
    shieldRecharge = 0;
    empCooldown = 0;
    empFlash = 0;
    isOver = false;
    shipX = virtualWidth / 2;
    notifyListeners();
  }

  // dx is in screen pixels.
  void moveShip(double dx) {
    if (isOver) return;
    shipX = (shipX + dx / scale).clamp(
      shipHalfWidth,
      virtualWidth - shipHalfWidth,
    );
    notifyListeners();
  }

  void select(Ability a) {
    selected = a;
    notifyListeners();
  }

  void useAbility() {
    if (isOver || vh == 0) return;
    switch (selected) {
      case Ability.gun:
        bullets.add(Bullet(shipX, shipTop - 2));
      case Ability.shield:
        if (shieldReady) shieldActive = shieldDuration;
      case Ability.emp:
        if (!empReady) return;
        empCooldown = empCooldownTime;
        empFlash = empFlashTime;
        empOriginX = shipX;
        for (final _ in ufos) {
          coins += ufoCoins;
          score += 100;
        }
        ufos.clear();
    }
  }

  void _updateAbilities(double dt) {
    if (shieldActive > 0) {
      shieldActive -= dt;
      if (shieldActive <= 0) {
        shieldActive = 0;
        shieldRecharge = shieldRechargeTime;
      }
    } else if (shieldRecharge > 0) {
      shieldRecharge = math.max(0, shieldRecharge - dt);
    }
    if (empCooldown > 0) empCooldown = math.max(0, empCooldown - dt);
    if (empFlash > 0) empFlash = math.max(0, empFlash - dt);
  }

  void _updateUfos(double dt) {
    ufos.removeWhere((u) {
      if (u.hp > 0) return false;
      coins += ufoCoins;
      score += 100;
      return true;
    });

    _ufoSpawnTimer -= dt;
    if (_ufoSpawnTimer <= 0) {
      _ufoSpawnTimer = math.max(6, 14 - elapsed * 0.08);
      if (ufos.length < (elapsed > 90 ? 3 : 2)) {
        ufos.add(
          Ufo(
            ufoHalfWidth +
                _rng.nextDouble() * (virtualWidth - 2 * ufoHalfWidth),
            1.5,
          ),
        );
      }
    }

    for (final u in ufos) {
      u.age += dt;
      u.hitFlash = math.max(0, u.hitFlash - dt);

      u.wanderTimer -= dt;
      if (u.wanderTimer <= 0) {
        u.wanderTimer = 1.5 + _rng.nextDouble() * 1.5;
        u.vx = (_rng.nextDouble() - 0.5) * 80;
        u.targetY = 14 + _rng.nextDouble() * vh * 0.3;
      }
      u.x += u.vx * dt;
      if (u.x < ufoHalfWidth) {
        u.x = ufoHalfWidth;
        u.vx = u.vx.abs();
      } else if (u.x > virtualWidth - ufoHalfWidth) {
        u.x = virtualWidth - ufoHalfWidth;
        u.vx = -u.vx.abs();
      }
      u.baseY += (u.targetY - u.baseY).clamp(-30 * dt, 30 * dt);
      u.y = u.baseY + math.sin(u.age * 2) * 3;

      u.fireTimer -= dt;
      if (u.fireTimer <= 0 && u.y > 4) {
        u.fireTimer =
            math.max(0.9, 2.2 - elapsed * 0.01) + _rng.nextDouble() * 0.8;
        final angle =
            math.atan2(shipCenterY - u.y, shipX - u.x) +
            (_rng.nextDouble() - 0.5) * 0.3;
        const shotSpeed = 80.0;
        shots.add(
          EnemyShot(
            u.x,
            u.y + ufoHalfHeight,
            math.cos(angle) * shotSpeed,
            math.sin(angle) * shotSpeed,
          ),
        );
      }
    }
  }

  void _updateShots(double dt) {
    final shielded = shieldActive > 0;
    final r = (shielded ? shieldRadius : shipHitRadius) + 1.5;
    shots.removeWhere((s) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      if (s.y > vh + 4 || s.x < -4 || s.x > virtualWidth + 4) return true;
      final dx = s.x - shipX;
      final dy = s.y - shipCenterY;
      if (dx * dx + dy * dy < r * r) {
        if (!shielded) isOver = true;
        return true;
      }
      return false;
    });
  }

  double get _fallSpeed => math.min(vh * 0.25 + vh * 0.01 * elapsed, vh * 1.2);

  double get _spawnInterval => math.max(0.22, 0.65 - elapsed * 0.008);

  void update(double dt) {
    if (vh == 0) return;

    final speed = _fallSpeed;
    for (final s in stars) {
      s.y += speed * 0.25 * s.depth * dt;
      if (s.y > vh) s.y %= vh;
    }

    if (!isOver) {
      elapsed += dt;
      score += dt * 10;

      _spawnTimer -= dt;
      if (_spawnTimer <= 0) {
        _spawnTimer = _spawnInterval;
        final r = 3 + _rng.nextInt(4);
        asteroids.add(
          Asteroid.create(
            _rng,
            r + _rng.nextDouble() * (virtualWidth - 2 * r),
            -r.toDouble(),
            r,
          ),
        );
      }

      _updateAbilities(dt);

      final destroyed = <Asteroid>{};
      final shielded = shieldActive > 0;
      final contact = shielded ? shieldRadius : shipHitRadius;
      for (final a in asteroids) {
        a.y += speed * dt;
        final dx = a.x - shipX;
        final dy = a.y - shipCenterY;
        final limit = a.radius * 0.9 + contact;
        if (dx * dx + dy * dy < limit * limit) {
          if (shielded) {
            destroyed.add(a);
          } else {
            isOver = true;
          }
        }
      }
      asteroids.removeWhere((a) => a.y - a.radius > vh);

      const bulletRadius = 2.0;
      bullets.removeWhere((b) {
        b.y -= vh * 1.2 * dt;
        if (b.y < -4) return true;
        for (final u in ufos) {
          if ((u.x - b.x).abs() < ufoHalfWidth + 1 &&
              (u.y - b.y).abs() < ufoHalfHeight + 2) {
            u.hp--;
            u.hitFlash = 0.1;
            return true;
          }
        }
        for (final a in asteroids) {
          if (destroyed.contains(a)) continue;
          final dx = a.x - b.x;
          final dy = a.y - b.y;
          final limit = a.radius * 0.9 + bulletRadius;
          if (dx * dx + dy * dy < limit * limit) {
            destroyed.add(a);
            score += 25;
            return true;
          }
        }
        return false;
      });
      asteroids.removeWhere(destroyed.contains);

      _updateUfos(dt);
      _updateShots(dt);
    }
    notifyListeners();
  }
}

class GameScreen extends StatefulWidget {
  const GameScreen({super.key});

  @override
  State<GameScreen> createState() => _GameScreenState();
}

class _GameScreenState extends State<GameScreen>
    with SingleTickerProviderStateMixin {
  final GameModel _game = GameModel();
  late final Ticker _ticker;
  Duration _last = Duration.zero;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker(_onTick)..start();
  }

  void _onTick(Duration now) {
    final dt = ((now - _last).inMicroseconds / 1e6).clamp(0.0, 0.05);
    _last = now;
    _game.update(dt);
  }

  @override
  void dispose() {
    _ticker.dispose();
    _game.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF050818),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(child: _buildGameArea()),
            AbilityBar(game: _game),
          ],
        ),
      ),
    );
  }

  Widget _buildGameArea() {
    return LayoutBuilder(
      builder: (context, constraints) {
        _game.setSize(constraints.biggest);
        return GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: _game.useAbility,
          onHorizontalDragUpdate: (d) => _game.moveShip(d.delta.dx),
          child: Stack(
            fit: StackFit.expand,
            children: [
              Positioned.fill(child: CustomPaint(painter: GamePainter(_game))),
              Positioned(
                top: 8,
                left: 16,
                right: 8,
                child: Row(
                  children: [
                    ListenableBuilder(
                      listenable: _game,
                      builder: (_, _) => Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('SCORE ${_game.score.floor()}', style: hudStyle),
                          Text(
                            'COINS ${_game.coins}',
                            style: hudStyle.copyWith(color: Colors.amberAccent),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    IconButton.filledTonal(
                      tooltip: 'Restart',
                      onPressed: _game.restart,
                      style: IconButton.styleFrom(
                        shape: const RoundedRectangleBorder(),
                      ),
                      icon: const Icon(Icons.refresh),
                    ),
                  ],
                ),
              ),
              ListenableBuilder(
                listenable: _game,
                builder: (_, _) {
                  if (!_game.isOver) return const SizedBox.shrink();
                  return Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Text(
                          'GAME OVER',
                          style: TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'SCORE ${_game.score.floor()}',
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 20,
                            color: Colors.white70,
                          ),
                        ),
                        const SizedBox(height: 24),
                        FilledButton.icon(
                          onPressed: _game.restart,
                          style: FilledButton.styleFrom(
                            shape: const RoundedRectangleBorder(),
                          ),
                          icon: const Icon(Icons.refresh),
                          label: const Padding(
                            padding: EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 12,
                            ),
                            child: Text(
                              'RESTART',
                              style: TextStyle(
                                fontFamily: 'monospace',
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
            ],
          ),
        );
      },
    );
  }
}

const hudStyle = TextStyle(
  fontFamily: 'monospace',
  fontSize: 16,
  fontWeight: FontWeight.bold,
  color: Colors.white,
);

const gunIcon = [
  '     WW     ',
  '    WYYW    ',
  '   WYYYYW   ',
  '   WYYYYW   ',
  '   WYYYYW   ',
  '   WYYYYW   ',
  '   OOOOOO   ',
  '   OOOOOO   ',
  '    R  R    ',
  '    R  R    ',
  '     RR     ',
  '            ',
];

const shieldIcon = [
  ' CCCCCCCCCC ',
  'CBBBBBBBBBBC',
  'CBBWWBBBBBBC',
  'CBBWBBBBBBBC',
  'CBBBBBBBBBBC',
  'CBBBBBBBBBBC',
  ' CBBBBBBBBC ',
  '  CBBBBBBC  ',
  '   CBBBBC   ',
  '    CBBC    ',
  '     CC     ',
  '            ',
];

const empIcon = [
  '      PPPPP ',
  '     PWWWP  ',
  '    PWWWP   ',
  '   PWWWP    ',
  '  PWWWWWWPP ',
  '  PPPPWWWP  ',
  '      PWWP  ',
  '     PWWP   ',
  '    PWWP    ',
  '    PWP     ',
  '   PWP      ',
  '   PP       ',
];

const gunIconPalette = <String, Color>{
  'W': Color(0xFFFFFFFF),
  'Y': Color(0xFFFFEE58),
  'O': Color(0xFFFF9800),
  'R': Color(0xFFE53935),
};

const shieldIconPalette = <String, Color>{
  'C': Color(0xFF0097A7),
  'B': Color(0xFF4DD0E1),
  'W': Color(0xFFFFFFFF),
};

const empIconPalette = <String, Color>{
  'P': Color(0xFFAB47BC),
  'W': Color(0xFFFFEE58),
};

List<String> iconFor(Ability a) => switch (a) {
  Ability.gun => gunIcon,
  Ability.shield => shieldIcon,
  Ability.emp => empIcon,
};

Map<String, Color> iconPaletteFor(Ability a) => switch (a) {
  Ability.gun => gunIconPalette,
  Ability.shield => shieldIconPalette,
  Ability.emp => empIconPalette,
};

class AbilityBar extends StatelessWidget {
  const AbilityBar({super.key, required this.game});

  final GameModel game;

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: game,
      builder: (_, _) => Padding(
        padding: const EdgeInsets.fromLTRB(8, 4, 8, 8),
        child: Row(
          children: [
            for (final a in Ability.values) ...[
              if (a != Ability.values.first) const SizedBox(width: 8),
              Expanded(
                child: _AbilityButton(
                  ability: a,
                  selected: game.selected == a,
                  progress: game.progressOf(a),
                  active: a == Ability.shield && game.shieldActive > 0,
                  onTap: () => game.select(a),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _AbilityButton extends StatelessWidget {
  const _AbilityButton({
    required this.ability,
    required this.selected,
    required this.progress,
    required this.active,
    required this.onTap,
  });

  final Ability ability;
  final bool selected;
  final double progress;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      selected: selected,
      label: ability.label,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: onTap,
        child: Container(
          height: 76,
          decoration: BoxDecoration(
            color: selected
                ? ability.color.withValues(alpha: 0.18)
                : const Color(0xFF111833),
            border: Border.all(
              color: selected ? ability.color : Colors.white24,
              width: 3,
            ),
          ),
          child: CustomPaint(
            painter: _PixelIconPainter(
              rows: iconFor(ability),
              palette: iconPaletteFor(ability),
              charge: progress.clamp(0.0, 1.0),
            ),
          ),
        ),
      ),
    );
  }
}

class _PixelIconPainter extends CustomPainter {
  _PixelIconPainter({
    required this.rows,
    required this.palette,
    required this.charge,
  });

  final List<String> rows;
  final Map<String, Color> palette;
  final double charge;

  @override
  void paint(Canvas canvas, Size size) {
    final n = rows.length;
    final ps = (math.min(size.width, size.height) * 0.8 / n).floorToDouble();
    if (ps < 1) return;
    final left = ((size.width - ps * n) / 2).floorToDouble();
    final top = ((size.height - ps * n) / 2).floorToDouble();
    final paint = Paint()..isAntiAlias = false;

    // Rows fill with color from the bottom up as the ability recharges.
    final firstLitRow = n * (1 - charge);
    for (var i = 0; i < n; i++) {
      final lit = i >= firstLitRow - 0.001;
      for (var j = 0; j < rows[i].length; j++) {
        final c = palette[rows[i][j]];
        if (c == null) continue;
        paint.color = lit
            ? c
            : Color.lerp(c, const Color(0xFF111833), 0.8) ?? c;
        canvas.drawRect(
          Rect.fromLTWH(left + j * ps, top + i * ps, ps, ps),
          paint,
        );
      }
    }
  }

  @override
  bool shouldRepaint(_PixelIconPainter old) =>
      old.charge != charge || old.rows != rows;
}

class GamePainter extends CustomPainter {
  GamePainter(this.game) : super(repaint: game);

  final GameModel game;

  final Paint _paint = Paint()..isAntiAlias = false;
  double _s = 1;

  // Rects are snapped to whole screen pixels so the virtual pixels stay crisp.
  void _fill(Canvas canvas, double x, double y, double w, double h, Color c) {
    _paint.color = c;
    canvas.drawRect(
      Rect.fromLTRB(
        (x * _s).floorToDouble(),
        (y * _s).floorToDouble(),
        ((x + w) * _s).ceilToDouble(),
        ((y + h) * _s).ceilToDouble(),
      ),
      _paint,
    );
  }

  void _sprite(
    Canvas canvas,
    List<String> rows,
    Map<String, Color> palette,
    double left,
    double top,
  ) {
    for (var i = 0; i < rows.length; i++) {
      final row = rows[i];
      var j = 0;
      while (j < row.length) {
        final ch = row[j];
        var end = j + 1;
        while (end < row.length && row[end] == ch) {
          end++;
        }
        final color = palette[ch];
        if (color != null) {
          _fill(canvas, left + j, top + i, (end - j).toDouble(), 1, color);
        }
        j = end;
      }
    }
  }

  @override
  void paint(Canvas canvas, Size size) {
    if (game.vh == 0) return;
    _s = game.scale;

    for (final s in game.stars) {
      final shade = (90 + 140 * s.depth).round();
      _fill(
        canvas,
        s.x.floorToDouble(),
        s.y.floorToDouble(),
        1,
        1,
        Color.fromARGB(255, shade, shade, shade),
      );
    }

    for (final a in game.asteroids) {
      _sprite(
        canvas,
        a.sprite,
        rockPalette,
        a.x.round() - a.radius.toDouble(),
        a.y.round() - a.radius.toDouble(),
      );
    }

    for (final u in game.ufos) {
      final blink = (u.age * 4).floor().isEven;
      final palette = {
        ...ufoPalette,
        'L': blink ? const Color(0xFFFFEE58) : const Color(0xFFE53935),
        'M': u.hitFlash > 0 ? Colors.white : const Color(0xFFB0BEC5),
      };
      _sprite(canvas, ufoSprite, palette, u.x.round() - 6.0, u.y.round() - 3.0);
    }

    for (final b in game.bullets) {
      _fill(
        canvas,
        b.x.round() - 1.0,
        b.y.roundToDouble() - 2,
        2,
        4,
        const Color(0xFFFFEE58),
      );
    }

    for (final s in game.shots) {
      final sx = s.x.roundToDouble();
      final sy = s.y.roundToDouble();
      _fill(canvas, sx - 1, sy - 1, 3, 3, const Color(0xFFFF4081));
      _fill(canvas, sx, sy, 1, 1, Colors.white);
    }

    if (!game.isOver) _drawShip(canvas);

    if (game.empFlash > 0) {
      final t = 1 - game.empFlash / empFlashTime;
      final r = t * game.vh * 1.1;
      final cx = game.empOriginX.roundToDouble();
      final cy = game.shipCenterY.roundToDouble();
      _ring(canvas, cx, cy, r, const Color(0xFFE040FB));
      _ring(canvas, cx, cy, r - 1, const Color(0xFFEA80FC));
    }
  }

  void _ring(Canvas canvas, double cx, double cy, double r, Color c) {
    if (r < 1) return;
    final n = (2 * math.pi * r).ceil();
    for (var i = 0; i < n; i++) {
      final a = i * 2 * math.pi / n;
      final x = (cx + math.cos(a) * r).roundToDouble();
      final y = (cy + math.sin(a) * r).roundToDouble();
      if (x < 0 || x >= virtualWidth || y < 0 || y >= game.vh) continue;
      _fill(canvas, x, y, 1, 1, c);
    }
  }

  void _drawShip(Canvas canvas) {
    final cx = game.shipX.roundToDouble();
    final top = game.shipTop.roundToDouble();
    _sprite(canvas, shipSprite, shipPalette, cx - 5, top);

    final long = (game.elapsed * 15).floor().isEven;
    _fill(canvas, cx - 1, top + shipHeight, 3, 1, const Color(0xFFFF9800));
    _fill(canvas, cx, top + shipHeight + 1, 1, 1, const Color(0xFFFFEB3B));
    if (long) {
      _fill(canvas, cx, top + shipHeight + 2, 1, 1, const Color(0xFFFF9800));
    }

    // Flicker during the last 0.3s so the player sees it running out.
    if (game.shieldActive > 0 &&
        (game.shieldActive > 0.3 || (game.shieldActive * 20).floor().isEven)) {
      _ring(
        canvas,
        cx,
        top + shipHeight / 2,
        shieldRadius,
        const Color(0xFF80F0FF),
      );
    }
  }

  @override
  bool shouldRepaint(covariant GamePainter oldDelegate) => false;
}
