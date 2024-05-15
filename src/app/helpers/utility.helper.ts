

export function addCommasIndianNumberSystem(numberString) {
    console.log(numberString)
    // Check if the number is negative
    let isNegative = false;
    if (numberString[0] === '-') {
        isNegative = true;
        numberString = numberString.substring(1); // Remove the negative sign
    }

    // Split the number string into integer and decimal parts
    const parts = numberString.split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1] || '';

    // Add commas to the integer part
    let result = '';
    while (integerPart.length > 3) {
        const chunk = integerPart.slice(-3);
        result = ',' + chunk + result;
        integerPart = integerPart.slice(0, -3);
    }
    result = integerPart + result;

    // Add the decimal part back
    if (decimalPart !== '') {
        result += '.' + decimalPart;
    }

    // Add back the negative sign if applicable
    if (isNegative) {
        result = '-' + result;
    }

    return result;
}