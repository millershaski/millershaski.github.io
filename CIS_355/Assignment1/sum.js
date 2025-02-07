// Tyler Millershaski
// CIS 355
// 19 Jan 2025
// A basic node application that sums two numbers that are passed as arguments via the command line


let number1 = TryGetArgument(2);
let number2 = TryGetArgument(3);

if(number1 == null || number2 == null) // null will be converted to 0, so we'll first check for null before trying to cast (so that we can terminate correctly if needed)
    return;

number1 = Number(number1); 
number2 = Number(number2);

if(isNaN(number1) == true) 
{
    console.error("The first passed argument should be a number. Terminating script");
    return;
}

if(isNaN(number2) == true)
{
    console.error("The second passed argument should be a number. Terminating script");
    return;
}

console.log("The sum of " + number1 + " and " + number2 + " is " + (number1+number2));


function TryGetArgument(index)
{
    if(process.argv.length <= index)
    {
        // this error message is confusing to a user, because they would expect that "index 2" means either the 2nd or 3rd argument and not the first (since there's always 2 arguments silently passed)
        console.error("Unable to find an argument at index: " + index + ". Did you forget to include it when invoking this script?")
        return null;
    }

    return process.argv[index];
}