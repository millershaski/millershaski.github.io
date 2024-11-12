

// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#292b2c';

// Bar Chart Example
var ctx = document.getElementById("myBarChart");
/*var myLineChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [{
      label: "Revenue",
      backgroundColor: "rgba(2,117,216,1)",
      borderColor: "rgba(2,117,216,1)",
      data: [4215, 5312, 6251, 7841, 9821, 14984],
    }],
  },
  options: {
    scales: {
      xAxes: [{
        time: {
          unit: 'month'
        },
        gridLines: {
          display: false
        },
        ticks: {
          maxTicksLimit: 6
        }
      }],
      yAxes: [{
        ticks: {
          min: 0,
          max: 15000,
          maxTicksLimit: 5
        },
        gridLines: {
          display: true
        }
      }],
    },
    legend: {
      display: false
    }
  }
});*/




async function GetAllCatTags()
{
  try
  {
    const response = await fetch("https://cataas.com/api/tags");
    if(response.ok == false)
      throw new Error("Network response was not ok");
    else
    {
      const json = await response.json();      
      return json;
    }
  } 
  catch(error)
  {
    console.error("An error occurred: " + error);
  }
  
  return null;
}


// returns an array that has random elements from allTags. Size of random array is numberToUse
function GetRandomTags(allTags, numberToUse)
{
  let returnValue = [];

  for(let i = 0; i < numberToUse; i++)
  {
    returnValue[i] = GetUnusedTag(allTags, returnValue);
  }

  return returnValue;
}


function GetUnusedTag(allTags, usedTags)
{
  let count = 0; // prevents infinite loops
  while(count < 20)
  {
    count++;

    let randomNumber = Math.floor(Math.random() * allTags.length);
    let randomElement = allTags[randomNumber];

    if(ArrayContains(usedTags, randomElement) == false)
      return randomElement
  }

  console.log("Unable to retrieve an unused cat tag");
  return null;
}


function ArrayContains(array, value)
{
  if(array == null)
    return false;

  for(let i = 0; i < array.length; i++)
  {
    if(array[i] == value)
      return true;
  }
  
  return false;
}



async function ChangeChart()
{    
  let allTags = await GetAllCatTags(); // get all the tags
  let selectedTags = GetRandomTags(allTags, 6); // then select 6 random tags to display
  let allCounts = await GetAllCatTagCounts(selectedTags);
  
  // we must recreate this so that the chart is populated again
  CreateNewChart(selectedTags, allCounts);
}


function CreateNewChart(selectedTags, allCounts)
{
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: selectedTags,
      datasets: [{
        label: "Cat Count",
        backgroundColor: "rgba(2,117,216,1)",
        borderColor: "rgba(2,117,216,1)",
        data: allCounts
      }],
    },
    options: {
      scales: {
        xAxes: [{
          time: {
            unit: 'month'
          },
          gridLines: {
            display: false
          },
          ticks: {
            maxTicksLimit: 6
          }
        }],
        yAxes: [{
          ticks: {
            min: 0,
            max: 10,
            maxTicksLimit: 5
          },
          gridLines: {
            display: true
          }
        }],
      },
      legend: {
        display: false
      }
    }
  });
}


async function GetAllCatTagCounts(selectedTags)
{ 
  let allCounts = [];

  for(let i = 0; i < selectedTags.length; i++)
  {
    const response = await fetch("https://cataas.com/api/cats?tags="+selectedTags[i]);
    if(response.ok == false)
      throw new Error("Network response was not ok");
    else
    {
      const json = await response.json();      
      allCounts[i] = json.length;    
    }
  }

  return allCounts;
}



ChangeChart();