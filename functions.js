var fs = require('fs'),
    path = require('path');

function tableTrace(func, n){
    for(var i=0; i<n; i++){
        console.log(padTo(5,i)+": "+func.call(this, i));
    }
}

function padTo(numCharacters, num){
    var numString = num.toString();

    numString = numString.substring(0,numCharacters);

    while(numString.length < numCharacters){
        numString+=" ";
    }

    return numString;
}

function logTable(n){
    console.log("=== log(x) =================================")
    tableTrace(Math.log,20);
    console.log("\n");
}

function expTable(n){
    console.log("=== exp(x) =================================")
    tableTrace(Math.exp,20);
    console.log("\n");
}

function sqrtTable(n){
    console.log("=== sqrt(x) =================================")
    tableTrace(Math.sqrt,20);
    console.log("\n");
}

function sinhTable(n){
    console.log("=== sinh(x) =================================")
    tableTrace(Math.sinh,20);
    console.log("\n");
}

function tanhTable(n){
    console.log("=== tanh(x) =================================")
    tableTrace(Math.tanh,20);
    console.log("\n");
}

function coshTable(n){
    console.log("=== cosh(x) =================================")
    tableTrace(Math.cosh,20);
    console.log("\n");
}

function asinhTable(n){
    console.log("=== asinh(x) =================================")
    tableTrace(Math.asinh,20);
    console.log("\n");
}

function atanhTable(n){
    console.log("=== atanh(x) =================================")
    tableTrace(Math.atanh,20);
    console.log("\n");
}

function acoshTable(n){
    console.log("=== acosh(x) =================================")
    tableTrace(Math.acosh,20);
    console.log("\n");
}

function inverselogTable(n){
    console.log("=== 1/log(x) =================================")
    var invlog = function(x){
        return (1/Math.log(x));
    }
    tableTrace(invlog,20);
    console.log("\n");
}

function multitrace(){
    //logTable(20);
    //expTable(20);
    //sqrtTable(20);
    //sinhTable(20);
    //tanhTable(20);
    //coshTable(20);
    //asinhTable(20);
    //atanhTable(20);
    //acoshTable(20);
    inverselogTable(20);
}

process.argv.forEach((val, index) => {
});


multitrace();