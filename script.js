/* --------------------- GLOBAL STRINGS --------------------- */
// displayStr: what the user sees in the input field
// update displayStr every time input field value is updated

let displayStr = "";
document.getElementById("displayText").addEventListener('input', () => {
    displayStr = document.getElementById("displayText").value;
})

// /* ------------------ CONVERSTION TABLE / Unit conversion ------------------- */
// conversionTable.js

const conversionTable = {
    angle: {
        degree: {
            degree: 1,
            radian: Math.PI / 180, // approximately 0.0174533
            gradian: 10 / 9, // approximately 1.11111
        },
        radian: {
            degree: 180 / Math.PI, // approximately 57.2958
            radian: 1,
            gradian: 200 / Math.PI, // approximately 63.662
        },
        gradian: {
            degree: 9 / 10 * 180, // approximately 81
            radian: Math.PI / 200, // approximately 0.01570796
            gradian: 1,
        },
    },
    area: {
        squareMeter: {
            squareMeter: 1,
            squareKilometer: 0.000001,
            squareCentimeter: 10000,
            squareMillimeter: 1000000,
            hectare: 0.0001,
            acre: 0.000247105,
            squareMile: 3.861e-7,
            squareYard: 1.19599,
            squareFoot: 10.7639,
            squareInch: 1550.0031,
        },
        squareKilometer: {
            squareMeter: 1000000,
            squareKilometer: 1,
            squareCentimeter: 1e10,
            squareMillimeter: 1e12,
            hectare: 100,
            acre: 247.105,
            squareMile: 0.386102,
            squareYard: 1195990.05,
            squareFoot: 10763910.4,
            squareInch: 1550003100,
        },
        squareCentimeter: {
            squareMeter: 0.0001,
            squareKilometer: 1e-10,
            squareCentimeter: 1,
            squareMillimeter: 100,
            hectare: 1e-8,
            acre: 2.47105e-8,
            squareMile: 3.861e-13,
            squareYard: 0.000119599,
            squareFoot: 0.00107639,
            squareInch: 0.15500031,
        },
        squareMillimeter: {
            squareMeter: 0.000001,
            squareKilometer: 1e-12,
            squareCentimeter: 0.01,
            squareMillimeter: 1,
            hectare: 1e-10,
            acre: 2.47105e-10,
            squareMile: 3.861e-16,
            squareYard: 0.00000119599,
            squareFoot: 0.0000107639,
            squareInch: 0.0015500031,
        },
        hectare: {
            squareMeter: 10000,
            squareKilometer: 0.01,
            squareCentimeter: 1e8,
            squareMillimeter: 1e10,
            hectare: 1,
            acre: 2.47105,
            squareMile: 0.003861,
            squareYard: 11959.9,
            squareFoot: 107639.1,
            squareInch: 15500031,
        },
        acre: {
            squareMeter: 4046.86,
            squareKilometer: 0.00404686,
            squareCentimeter: 40468600,
            squareMillimeter: 4.04686e7,
            hectare: 0.404686,
            acre: 1,
            squareMile: 0.0015625,
            squareYard: 4840,
            squareFoot: 43560,
            squareInch: 6272640,
        },
        squareMile: {
            squareMeter: 2589988.11,
            squareKilometer: 2.58999,
            squareCentimeter: 2.58999e10,
            squareMillimeter: 2.58999e12,
            hectare: 258.998,
            acre: 640,
            squareMile: 1,
            squareYard: 3097600,
            squareFoot: 27878400,
            squareInch: 4014489600,
        },
        squareYard: {
            squareMeter: 0.836127,
            squareKilometer: 8.36127e-7,
            squareCentimeter: 8361.27,
            squareMillimeter: 836127,
            hectare: 0.0000836127,
            acre: 0.000190258,
            squareMile: 3.228e-7,
            squareYard: 1,
            squareFoot: 9,
            squareInch: 1296,
        },
        squareFoot: {
            squareMeter: 0.092903,
            squareKilometer: 9.2903e-8,
            squareCentimeter: 929.030,
            squareMillimeter: 92903.0,
            hectare: 9.2903e-6,
            acre: 2.2957e-6,
            squareMile: 3.587e-9,
            squareYard: 0.111111,
            squareFoot: 1,
            squareInch: 144,
        },
        squareInch: {
            squareMeter: 0.00064516,
            squareKilometer: 6.4516e-10,
            squareCentimeter: 6.4516,
            squareMillimeter: 645.16,
            hectare: 6.4516e-8,
            acre: 1.5873e-8,
            squareMile: 3.978e-13,
            squareYard: 0.000771605,
            squareFoot: 0.00694444,
            squareInch: 1,
        },
    },
    digitalStorage: {
        bit: {
            bit: 1,
            byte: 0.125,
            kilobit: 0.001,
            kilobyte: 0.000125,
            megabit: 1e-6,
            megabyte: 1.25e-7,
            gigabit: 1e-9,
            gigabyte: 1.25e-10,
            terabit: 1e-12,
            terabyte: 1.25e-13,
            petabit: 1e-15,
            petabyte: 1.25e-16,
            exabit: 1e-18,
            exabyte: 1.25e-19,
            zettabit: 1e-21,
            zettabyte: 1.25e-22,
            yobibit: 1e-24,
            yobibyte: 1.25e-25,
        },
        byte: {
            bit: 8,
            byte: 1,
            kilobit: 0.008,
            kilobyte: 0.001,
            megabit: 0.000008,
            megabyte: 1e-6,
            gigabit: 8e-9,
            gigabyte: 1e-9,
            terabit: 8e-12,
            terabyte: 1e-12,
            petabit: 8e-15,
            petabyte: 1e-15,
            exabit: 8e-18,
            exabyte: 1e-18,
            zettabit: 8e-21,
            zettabyte: 1e-21,
            yobibit: 8e-24,
            yobibyte: 1e-24,
        },
        kilobit: {
            bit: 1000,
            byte: 125,
            kilobit: 1,
            kilobyte: 0.125,
            megabit: 0.001,
            megabyte: 0.000125,
            gigabit: 1e-6,
            gigabyte: 1.25e-7,
            terabit: 1e-9,
            terabyte: 1.25e-10,
            petabit: 1e-12,
            petabyte: 1.25e-13,
            exabit: 1e-15,
            exabyte: 1.25e-16,
            zettabit: 1e-18,
            zettabyte: 1.25e-19,
            yobibit: 1e-21,
            yobibyte: 1.25e-22,
        },
        kilobyte: {
            bit: 8000,
            byte: 1000,
            kilobit: 8,
            kilobyte: 1,
            megabit: 0.008,
            megabyte: 0.001,
            gigabit: 8e-6,
            gigabyte: 1e-6,
            terabit: 8e-9,
            terabyte: 1e-9,
            petabit: 8e-12,
            petabyte: 1e-12,
            exabit: 8e-15,
            exabyte: 1e-15,
            zettabit: 8e-18,
            zettabyte: 1e-18,
            yobibit: 8e-21,
            yobibyte: 1e-21,
        },
        megabit: {
            bit: 1e6,
            byte: 125000,
            kilobit: 1000,
            kilobyte: 125,
            megabit: 1,
            megabyte: 0.125,
            gigabit: 0.001,
            gigabyte: 1.25e-4,
            terabit: 1e-6,
            terabyte: 1.25e-7,
            petabit: 1e-9,
            petabyte: 1.25e-10,
            exabit: 1e-12,
            exabyte: 1.25e-13,
            zettabit: 1e-15,
            zettabyte: 1.25e-16,
            yobibit: 1e-18,
            yobibyte: 1.25e-16,
        },
        megabyte: {
            bit: 8e6,
            byte: 1e6,
            kilobit: 8000,
            kilobyte: 1000,
            megabit: 8,
            megabyte: 1,
            gigabit: 0.008,
            gigabyte: 0.001,
            terabit: 8e-9,
            terabyte: 1e-9,
            petabit: 8e-12,
            petabyte: 1e-12,
            exabit: 8e-15,
            exabyte: 1e-15,
            zettabit: 8e-18,
            zettabyte: 1e-18,
            yobibit: 8e-21,
            yobibyte: 1e-21,
        },
        gigabit: {
            bit: 1e9,
            byte: 125000000,
            kilobit: 1000000,
            kilobyte: 125000,
            megabit: 1000,
            megabyte: 125,
            gigabit: 1,
            gigabyte: 0.125,
            terabit: 0.001,
            terabyte: 0.000125,
            petabit: 1e-6,
            petabyte: 1.25e-7,
            exabit: 1e-9,
            exabyte: 1.25e-10,
            zettabit: 1e-12,
            zettabyte: 1.25e-13,
            yobibit: 1e-15,
            yobibyte: 1.25e-16,
        },
        gigabyte: {
            bit: 8e9,
            byte: 1e9,
            kilobit: 8000000,
            kilobyte: 1000000,
            megabit: 8000,
            megabyte: 1000,
            gigabit: 8,
            gigabyte: 1,
            terabit: 0.008,
            terabyte: 0.001,
            petabit: 8e-9,
            petabyte: 1e-9,
            exabit: 8e-12,
            exabyte: 1e-12,
            zettabit: 8e-15,
            zettabyte: 1e-15,
            yobibit: 8e-18,
            yobibyte: 1e-18,
        },
        terabit: {
            bit: 1e12,
            byte: 125000000000,
            kilobit: 1000000000,
            kilobyte: 125000000,
            megabit: 1000000,
            megabyte: 125000,
            gigabit: 1000,
            gigabyte: 125,
            terabit: 1,
            terabyte: 0.125,
            petabit: 0.001,
            petabyte: 0.000125,
            exabit: 1e-6,
            exabyte: 1.25e-7,
            zettabit: 1e-9,
            zettabyte: 1.25e-10,
            yobibit: 1e-12,
            yobibyte: 1.25e-13,
        },
        terabyte: {
            bit: 8e12,
            byte: 1e12,
            kilobit: 8000000000,
            kilobyte: 1000000000,
            megabit: 8000000,
            megabyte: 1000000,
            gigabit: 8000,
            gigabyte: 1000,
            terabit: 8,
            terabyte: 1,
            petabit: 0.008,
            petabyte: 0.001,
            exabit: 8e-6,
            exabyte: 1e-6,
            zettabit: 8e-9,
            zettabyte: 1e-9,
            yobibit: 8e-12,
            yobibyte: 1e-12,
        },
        petabit: {
            bit: 1e15,
            byte: 1.25e14,
            kilobit: 1e12,
            kilobyte: 1.25e11,
            megabit: 1e9,
            megabyte: 1.25e8,
            gigabit: 1000,
            gigabyte: 125,
            terabit: 8,
            terabyte: 1,
            petabit: 1,
            petabyte: 0.125,
            exabit: 0.001,
            exabyte: 1.25e-4,
            zettabit: 1e-6,
            zettabyte: 1.25e-7,
            yobibit: 1e-9,
            yobibyte: 1.25e-10,
        },
        petabyte: {
            bit: 8e15,
            byte: 1e15,
            kilobit: 8e12,
            kilobyte: 1e12,
            megabit: 8e9,
            megabyte: 1e9,
            gigabit: 8e6,
            gigabyte: 1e6,
            terabit: 8e3,
            terabyte: 1e3,
            petabit: 8,
            petabyte: 1,
            exabit: 0.008,
            exabyte: 0.001,
            zettabit: 8e-6,
            zettabyte: 1e-6,
            yobibit: 8e-9,
            yobibyte: 1e-9,
        },
        exabit: {
            bit: 1e18,
            byte: 1.25e17,
            kilobit: 1e15,
            kilobyte: 1.25e14,
            megabit: 1e12,
            megabyte: 1.25e11,
            gigabit: 1e9,
            gigabyte: 1.25e8,
            terabit: 1e6,
            terabyte: 1.25e5,
            petabit: 1000,
            petabyte: 125,
            exabit: 1,
            exabyte: 0.125,
            zettabit: 1e-3,
            zettabyte: 1.25e-4,
            yobibit: 1e-6,
            yobibyte: 1.25e-7,
        },
        exabyte: {
            bit: 8e18,
            byte: 1e18,
            kilobit: 8e15,
            kilobyte: 1e15,
            megabit: 8e12,
            megabyte: 1e12,
            gigabit: 8e9,
            gigabyte: 1e9,
            terabit: 8e6,
            terabyte: 1e6,
            petabit: 8e3,
            petabyte: 1e3,
            exabit: 8,
            exabyte: 1,
            zettabit: 8e-3,
            zettabyte: 1e-3,
            yobibit: 8e-6,
            yobibyte: 1e-6,
        },
        zettabit: {
            bit: 1e21,
            byte: 1.25e20,
            kilobit: 1e19,
            kilobyte: 1.25e18,
            megabit: 1e16,
            megabyte: 1.25e15,
            gigabit: 1e13,
            gigabyte: 1.25e12,
            terabit: 1e10,
            terabyte: 1.25e9,
            petabit: 1e7,
            petabyte: 1.25e6,
            exabit: 1000,
            exabyte: 125,
            zettabit: 1,
            zettabyte: 0.125,
            yobibit: 1e-3,
            yobibyte: 1.25e-4,
        },
        zettabyte: {
            bit: 8e21,
            byte: 1e21,
            kilobit: 8e18,
            kilobyte: 1e18,
            megabit: 8e15,
            megabyte: 1e15,
            gigabit: 8e12,
            gigabyte: 1e12,
            terabit: 8e9,
            terabyte: 1e9,
            petabit: 8e6,
            petabyte: 1e6,
            exabit: 8e3,
            exabyte: 1e3,
            zettabit: 8,
            zettabyte: 1,
            yobibit: 8e-3,
            yobibyte: 1e-3,
        },
        yobibit: {
            bit: 1e24,
            byte: 1.25e23,
            kilobit: 1e21,
            kilobyte: 1.25e20,
            megabit: 1e18,
            megabyte: 1.25e17,
            gigabit: 1e15,
            gigabyte: 1.25e14,
            terabit: 1e12,
            terabyte: 1.25e11,
            petabit: 1e9,
            petabyte: 1.25e8,
            exabit: 1e6,
            exabyte: 1.25e5,
            zettabit: 1000,
            zettabyte: 125,
            yobibit: 1,
            yobibyte: 0.125,
        },
        yobibyte: {
            bit: 8e24,
            byte: 1e24,
            kilobit: 8e21,
            kilobyte: 1e21,
            megabit: 8e18,
            megabyte: 1e18,
            gigabit: 8e15,
            gigabyte: 1e15,
            terabit: 8e12,
            terabyte: 1e12,
            petabit: 8e9,
            petabyte: 1e9,
            exabit: 8e6,
            exabyte: 1e6,
            zettabit: 8e3,
            zettabyte: 1e3,
            yobibit: 8,
            yobibyte: 1,
        },
    },
    energy: {
        joule: {
            joule: 1,
            btu: 0.000947817,
            calorie: 0.239006,
            ev: 6.242e+18,
            erg: 1e7,
            ftLb: 0.737562,
        },
        btu: {
            joule: 1055.06,
            btu: 1,
            calorie: 252.164,
            ev: 2.625e+19,
            erg: 1.05506e+21,
            ftLb: 778.169,
        },
        calorie: {
            joule: 4.184,
            btu: 0.00396832,
            calorie: 1,
            ev: 1.602e+19,
            erg: 4.184e+10,
            ftLb: 0.001,
        },
        ev: {
            joule: 1.602e-19,
            btu: 3.8e-16,
            calorie: 3.8e-17,
            ev: 1,
            erg: 1.602e-13,
            ftLb: 1.18e-20,
        },
        erg: {
            joule: 1e-7,
            btu: 9.478e-8,
            calorie: 2.39e-7,
            ev: 6.242e+16,
            erg: 1,
            ftLb: 7.375e-8,
        },
        ftLb: {
            joule: 1.35582,
            btu: 0.00128507,
            calorie: 0.355822,
            ev: 8.45e+18,
            erg: 1.35582e+10,
            ftLb: 1,
        },

    },
    frequency: {
        terahertz: {
            terahertz: 1,
            gigahertz: 1000,
            megahertz: 1e6,
            kilohertz: 1e9,
            hertz: 1e12,
        },
        gigahertz: {
            terahertz: 0.001,
            gigahertz: 1,
            megahertz: 1000,
            kilohertz: 1e6,
            hertz: 1e9,
        },
        megahertz: {
            terahertz: 1e-6,
            gigahertz: 0.001,
            megahertz: 1,
            kilohertz: 1000,
            hertz: 1e6,
        },
        kilohertz: {
            terahertz: 1e-9,
            gigahertz: 1e-6,
            megahertz: 0.001,
            kilohertz: 1,
            hertz: 1000,
        },
        hertz: {
            terahertz: 1e-12,
            gigahertz: 1e-9,
            megahertz: 1e-6,
            kilohertz: 0.001,
            hertz: 1,
        },

    },
    length: {
        meter: {
            meter: 1,
            kilometer: 0.001,
            centimeter: 100,
            millimeter: 1000,
            micrometer: 1e6,
            nanometer: 1e9,
            mile: 0.000621371,
            yard: 1.09361,
            foot: 3.28084,
            inch: 39.3701,
            lightyear: 1.057e-17,
            astronomicalunit: 6.68459e-12,
            parsec: 3.24078e-17,
        },
        kilometer: {
            meter: 1000,
            kilometer: 1,
            centimeter: 100000,
            millimeter: 1000000,
            micrometer: 1e9,
            nanometer: 1e12,
            mile: 0.621371,
            yard: 1094,
            foot: 3280.84,
            inch: 39370.1,
            lightyear: 1.057e-13,
            astronomicalunit: 6.68459e-9,
            parsec: 3.24078e-14,
        },
        centimeter: {
            meter: 0.01,
            kilometer: 0.00001,
            centimeter: 1,
            millimeter: 10,
            micrometer: 10000,
            nanometer: 1e7,
            mile: 6.21371e-6,
            yard: 0.0109361,
            foot: 0.0328084,
            inch: 0.393701,
            lightyear: 1.057e-18,
            astronomicalunit: 6.68459e-14,
            parsec: 3.24078e-19,
        },
        millimeter: {
            meter: 0.001,
            kilometer: 0.000001,
            centimeter:0.1,
            millimeter: 1,
            micrometer: 1000,
            nanometer: 1e6,
            mile: 6.21371e-7,
            yard: 0.00109361,
            foot: 0.00328084,
            inch: 0.0393701,
            astronomicalUnit: 6.68459e-10,
            parsec: 3.24078e-13,
            lightyear: 1.057e-18,
        },
        micrometer: {
            meter: 1e-6,
            kilometer: 1e-9,
            centimeter: 1e-4,
            millimeter: 0.001,
            micrometer: 1,
            nanometer: 1000,
            mile: 6.21371e-10,
            yard: 1.09361e-6,
            foot: 3.28084e-6,
            inch: 3.93701e-5,
            astronomicalUnit: 6.68459e-13,
            parsec: 3.24078e-16,
            lightyear: 1.057e-21,
        },
        nanometer: {
            meter: 1e-9,
            kilometer: 1e-12,
            centimeter: 1e-7,
            millimeter: 1e-6,
            micrometer: 0.001,
            nanometer: 1,
            mile: 6.21371e-13,
            yard: 1.09361e-9,
            foot: 3.28084e-9,
            inch: 3.93701e-8,
            astronomicalUnit: 6.68459e-16,
            parsec: 3.24078e-19,
            lightyear: 1.057e-24,
        },        
        mile: {
            meter: 1609.34,
            kilometer: 1.60934,
            centimeter: 160934,
            millimeter: 1609340,
            micrometer: 1.60934e+9,
            nanometer: 1.60934e+12,
            mile: 1,
            yard: 1760,
            foot: 5280,
            inch: 63360,
            astronomicalUnit: 1.5783e-13,
            parsec: 4.84814e-14,
            lightyear: 1.7011e-12,
        },
        yard: {
            meter: 0.9144,
            kilometer: 0.0009144,
            centimeter: 91.44,
            millimeter: 914.4,
            micrometer: 9.144e+5,
            nanometer: 9.144e+8,
            mile: 0.000568182,
            yard: 1,
            foot: 3,
            inch: 36,
            astronomicalUnit: 5.68459e-14,
            parsec: 1.7575e-14,
            lightyear: 6.2137e-13,
        },
        foot: {
            meter: 0.3048,
            kilometer: 0.0003048,
            centimeter: 30.48,
            millimeter: 304.8,
            micrometer: 3.048e+5,
            nanometer: 3.048e+8,
            mile: 0.000189394,
            yard: 0.333333,
            foot: 1,
            inch: 12,
            astronomicalUnit: 3.21599e-14,
            parsec: 9.86923e-15,
            lightyear: 3.28084e-13,
        },
        inch: {
            meter: 0.0254,
            kilometer: 0.0000254,
            centimeter: 2.54,
            millimeter: 25.4,
            micrometer: 25400,
            nanometer: 2.54e+7,
            mile: 1.5783e-5,
            yard: 0.0277778,
            foot: 0.0833333,
            inch: 1,
            astronomicalUnit: 2.53998e-15,
            parsec: 6.57988e-16,
            lightyear: 2.3622e-14,
        },
        astronomicalUnit: {
            meter: 1.496e+11,
            kilometer: 1.496e+8,
            centimeter: 1.496e+13,
            millimeter: 1.496e+12,
            micrometer: 1.496e+15,
            nanometer: 1.496e+18,
            mile: 9.295e+11,
            yard: 1.64042e+12,
            foot: 4.928e+11,
            inch: 1.577e+13,
            astronomicalUnit: 1,
            parsec: 4.84814e-5,
            lightyear: 1.58125e-5,
        },
        parsec: {
            meter: 3.086e+16,
            kilometer: 3.086e+13,
            centimeter: 3.086e+18,
            millimeter: 3.086e+19,
            micrometer: 3.086e+22,
            nanometer: 3.086e+25,
            mile: 1.91734e+13,
            yard: 3.375e+19,
            foot: 1.0135e+19,
            inch: 1.26765e+20,
            astronomicalUnit: 206264.8,
            parsec: 1,
            lightyear: 3.262e+16,
        },
        lightyear: {
            meter: 9.461e+15,
            kilometer: 9.461e+12,
            centimeter: 9.461e+17,
            millimeter: 9.461e+18,
            micrometer: 9.461e+21,
            nanometer: 9.461e+24,
            mile: 5.8786e+12,
            yard: 1.042e+19,
            foot: 3.162e+18,
            inch: 3.784e+19,
            astronomicalUnit: 63241.1,
            parsec: 0.306601,
            lightyear: 1,
        },
    },
    mass: {
        kilogram: {
            kilogram: 1,
            gram: 1000,
            milligram: 1e6,
            microgram: 1e9,
            tonne: 0.001,
            pound: 2.20462,
            ounce: 35.274,
            stone: 0.157473,
            shortTon: 0.00110231,
            carat: 5000,
            atomicMassUnit: 6.022e26,
        },
        gram: {
            kilogram: 0.001,
            gram: 1,
            milligram: 1000,
            microgram: 1e6,
            tonne: 1e-6,
            pound: 0.00220462,
            ounce: 0.035274,
            stone: 0.000157473,
            shortTon: 2.20462e-6,
            carat: 5,
            atomicMassUnit: 6.022e23,
        },
        milligram: {
            kilogram: 1e-6,
            gram: 0.001,
            milligram: 1,
            microgram: 1000,
            tonne: 1e-9,
            pound: 2.20462e-6,
            ounce: 3.5274e-5,
            stone: 1.57473e-8,
            shortTon: 2.20462e-9,
            carat: 0.005,
            atomicMassUnit: 6.022e20,
        },
        microgram: {
            kilogram: 1e-9,
            gram: 1e-6,
            milligram: 0.001,
            microgram: 1,
            tonne: 1e-12,
            pound: 2.20462e-9,
            ounce: 3.5274e-7,
            stone: 1.57473e-10,
            shortTon: 2.20462e-12,
            carat: 5e-3,
            atomicMassUnit: 6.022e17,
        },
        tonne: {
            kilogram: 1000,
            gram: 1e6,
            milligram: 1e9,
            microgram: 1e12,
            tonne: 1,
            pound: 2204.62,
            ounce: 35274,
            stone: 157.473,
            shortTon: 1.10231,
            carat: 500000,
            atomicMassUnit: 6.022e29,
        },
        pound: {
            kilogram: 0.453592,
            gram: 453.592,
            milligram: 453592,
            microgram: 453592000,
            tonne: 0.000453592,
            pound: 1,
            ounce: 16,
            stone: 0.0714286,
            shortTon: 0.0005,
            carat: 226.796,
            atomicMassUnit: 3.002e26,
        },
        ounce: {
            kilogram: 0.0283495,
            gram: 28.3495,
            milligram: 28349.5,
            microgram: 28349500,
            tonne: 2.83495e-5,
            pound: 0.0625,
            ounce: 1,
            stone: 0.00446429,
            shortTon: 3.125e-5,
            carat: 14.1748,
            atomicMassUnit: 1.875e25,
        },
        stone: {
            kilogram: 6.35029,
            gram: 6350.29,
            milligram: 6350290,
            microgram: 6.35029e6,
            tonne: 0.00635029,
            pound: 14,
            ounce: 224,
            stone: 1,
            shortTon: 0.00625,
            carat: 3175.01,
            atomicMassUnit: 1.408e27,
        },
        shortTon: {
            kilogram: 907.185,
            gram: 907185,
            milligram: 907185000,
            microgram: 9.07185e8,
            tonne: 0.907185,
            pound: 2000,
            ounce: 32000,
            stone: 157.473,
            shortTon: 1,
            carat: 453592,
            atomicMassUnit: 2.014e29,
        },
        longTon: {
            kilogram: 1016.05,
            gram: 1016050,
            milligram: 1.01605e6,
            microgram: 1.01605e9,
            tonne: 1.01605,
            pound: 2240,
            ounce: 35840,
            stone: 160,
            shortTon: 1.12,
            carat: 508000,
            atomicMassUnit: 2.246e29,
        },

        carat: {
            kilogram: 0.0002,
            gram: 0.2,
            milligram: 200,
            microgram: 200000,
            tonne: 2e-7,
            pound: 0.000440924,
            ounce: 0.007055,
            stone: 0.00003175,
            shortTon: 4.40924e-7,
            carat: 1,
            atomicMassUnit: 1.204e24,
        },
        atomicMassUnit: {
            kilogram: 1.66054e-27,
            gram: 1.66054e-24,
            milligram: 1.66054e-21,
            microgram: 1.66054e-18,
            tonne: 1.66054e-30,
            pound: 3.66087e-27,
            ounce: 5.775e-26,
            stone: 2.621e-30,
            shortTon: 1.835e-27,
            carat: 8.3e-25,
            atomicMassUnit: 1,
        },
    },
    speed: {
        meterPerSecond: {
            meterPerSecond: 1,
            kilometerPerSecond: 0.001,
            milePerHour: 2.23694,
            knot: 1.94384,
            footPerSecond: 3.28084,
            mach: 0.00293858,
            speedOfLight: 3.33564e-9,
        },
        kilometerPerSecond: {
            meterPerSecond: 1000,
            kilometerPerSecond: 1,
            milePerHour: 2236.94,
            knot: 1943.84,
            footPerSecond: 3280.84,
            mach: 2.93858,
            speedOfLight: 3.33564e-6,
        },
        milePerHour: {
            meterPerSecond: 0.44704,
            kilometerPerSecond: 0.00044704,
            milePerHour: 1,
            knot: 0.868976,
            footPerSecond: 1.46667,
            mach: 0.00130332,
            speedOfLight: 1.46667e-9,
        },
        knot: {
            meterPerSecond: 0.514444,
            kilometerPerSecond: 0.000514444,
            milePerHour: 1.15078,
            knot: 1,
            footPerSecond: 1.68781,
            mach: 0.00145149,
            speedOfLight: 1.68781e-9,
        },
        footPerSecond: {
            meterPerSecond: 0.3048,
            kilometerPerSecond: 0.0003048,
            milePerHour: 0.681818,
            knot: 0.592484,
            footPerSecond: 1,
            mach: 0.000868976,
            speedOfLight: 8.0467e-10,
        },
        mach: {
            meterPerSecond: 340.29,
            kilometerPerSecond: 0.34029,
            milePerHour: 761.207,
            knot: 659.84,
            footPerSecond: 1116.44,
            mach: 1,
            speedOfLight: 0.000898,
        },
        speedOfLight: {
            meterPerSecond: 299792458,
            kilometerPerSecond: 299792.458,
            milePerHour: 670616629.384,
            knot: 518400,
            footPerSecond: 983571056.88,
            mach: 332.63,
            speedOfLight: 1,
        },

    },
    temperature: {
        celsiusToCelsius: (c) => c,
        celsiusToFahrenheit: (c) => (c * 9 / 5) + 32,
        celsiusToKelvin: (c) => c + 273.15,
        celsiusToRankine: (c) => (c + 273.15) * 9 / 5,

        fahrenheitToCelsius: (f) => (f - 32) * 5 / 9,
        fahrenheitToFahrenheit: (f) => f,
        fahrenheitToKelvin: (f) => (f - 32) * 5 / 9 + 273.15,
        fahrenheitToRankine: (f) => f + 459.67,

        kelvinToCelsius: (k) => k - 273.15,
        kelvinToFahrenheit: (k) => (k - 273.15) * 9 / 5 + 32,
        kelvinToKelvin: (k) => k,
        kelvinToRankine: (k) => k * 9 / 5,

        rankineToCelsius: (r) => (r - 491.67) * 5 / 9,
        rankineToFahrenheit: (r) => r - 459.67,
        rankineToKelvin: (r) => r * 5 / 9,
        rankineToRankine: (r) => r,
    },
    time: {
        millennium: {
            millennium: 1,
            century: 10,
            decade: 100,
            year: 1000,
            month: 12000,
            week: 521.428,
            day: 365242.5,
            hour: 8765820,
            minute: 525949200,
            second: 31556952000,
            millisecond: 3.1556952e15,
            microsecond: 3.1556952e18,
        },
        century: {
            millennium: 0.1,
            century: 1,
            decade: 10,
            year: 100,
            month: 1200,
            week: 5214.29,
            day: 36524.25,
            hour: 876576,
            minute: 52594920,
            second: 3155760000,
            millisecond: 3.15576e12,
            microsecond: 3.15576e15,
        },
        decade: {
            millennium: 0.01,
            century: 0.1,
            decade: 1,
            year: 10,
            month: 120,
            week: 521.428,
            day: 3652.425,
            hour: 87658.2,
            minute: 5259492,
            second: 315576000,
            millisecond: 3.15576e9,
            microsecond: 3.15576e12,
        },
        year: {
            millennium: 0.001,
            century: 0.01,
            decade: 0.1,
            year: 1,
            month: 12,
            week: 52.1429,
            day: 365,
            hour: 8760,
            minute: 525600,
            second: 31536000,
            millisecond: 3.1536e10,
            microsecond: 3.1536e13,
        },
        month: {
            millennium: 0.0000833333,
            century: 0.001,
            decade: 0.00833333,
            year: 0.0833333,
            month: 1,
            week: 4.34524,
            day: 30.4369,
            hour: 730.001,
            minute: 43800.1,
            second: 2629746,
            millisecond: 2.629746e9,
            microsecond: 2.629746e12,
        },
        week: {
            millennium: 0.0000191781,
            century: 0.000217,
            decade: 0.002,
            year: 0.0191781,
            month: 0.229979,
            week: 1,
            day: 7,
            hour: 168,
            minute: 10080,
            second: 604800,
            millisecond: 6.048e11,
            microsecond: 6.048e14,
        },
        day: {
            millennium: 0.00000273785,
            century: 0.0000273785,
            decade: 0.000273785,
            year: 0.00273785,
            month: 0.032854,
            week: 0.142857,
            day: 1,
            hour: 24,
            minute: 1440,
            second: 86400,
            millisecond: 8.64e7,
            microsecond: 8.64e10,
        },
        hour: {
            millennium: 0.000000114155,
            century: 0.00000114155,
            decade: 0.0000114155,
            year: 0.000114155,
            month: 0.00114065,
            week: 0.00595238,
            day: 0.0416667,
            hour: 1,
            minute: 60,
            second: 3600,
            millisecond: 3.6e6,
            microsecond: 3.6e9,
        },
        minute: {
            millennium: 0.00000000190259,
            century: 0.0000190259,
            decade: 0.000190259,
            year: 0.00190259,
            month: 0.0228311,
            week: 0.100800,
            day: 0.000694444,
            hour: 0.0166667,
            minute: 1,
            second: 60,
            millisecond: 60000,
            microsecond: 6e10,
        },
        second: {
            millennium: 3.16888e-14,
            century: 3.16888e-12,
            decade: 3.16888e-11,
            year: 3.16888e-10,
            month: 3.80518e-9,
            week: 1.65344e-7,
            day: 0.0000115741,
            hour: 0.000277778,
            minute: 0.0166667,
            second: 1,
            millisecond: 1000,
            microsecond: 1e6,
        },
        millisecond: {
            millennium: 3.16888e-11,
            century: 3.16888e-9,
            decade: 3.16888e-8,
            year: 3.16888e-7,
            month: 3.80518e-6,
            week: 1.65344e-4,
            day: 0.0864,
            hour: 0.000277778,
            minute: 0.0166667,
            second: 0.001,
            millisecond: 1,
            microsecond: 1000,
        },
        microsecond: {
            millennium: 3.16888e-8,
            century: 3.16888e-6,
            decade: 3.16888e-5,
            year: 3.16888e-4,
            month: 3.80518e-3,
            week: 1.65344e-1,
            day: 86400,
            hour: 0.000277778,
            minute: 0.0166667,
            second: 0.000001,
            millisecond: 0.001,
            microsecond: 1,
        },
    },
    volume: {
        cubicMeter: {
            cubicMeter: 1,
            liter: 1000,
            milliliter: 1e6,
            cubicKilometer: 1e-9,
            cubicFoot: 35.3147,
            cubicInch: 61023.7,
            cubicYard: 1.30795,
            gallon: 264.172,
            quart: 105.668,
            pint: 211.337,
            cup: 4226.75,
            fluidOunce: 33814,
            cubicCentimeter: 1e6, // 1 cubic meter = 1,000,000 cubic centimeters
            cubicMillimeter: 1e9  // 1 cubic meter = 1,000,000,000 cubic millimeters
        },
        liter: {
            cubicMeter: 0.001,
            liter: 1,
            milliliter: 1000,
            cubicKilometer: 1e-12,
            cubicFoot: 0.0353147,
            cubicInch: 61.0237,
            cubicYard: 0.00130795,
            gallon: 0.264172,
            quart: 1.05669,
            pint: 2.11337,
            cup: 4.22675,
            fluidOunce: 33.814,
            cubicCentimeter: 1000,
            cubicMillimeter: 1e6,
        },
        milliliter: {
            cubicMeter: 1e-6,
            liter: 0.001,
            milliliter: 1,
            cubicKilometer: 1e-15,
            cubicFoot: 0.0000353147,
            cubicInch: 0.0610237,
            cubicYard: 0.00000130795,
            gallon: 0.000264172,
            quart: 0.00105669,
            pint: 0.00211337,
            cup: 0.00422675,
            fluidOunce: 0.033814,
            cubicCentimeter: 1,cubicMillimeter: 1000,
        },
        cubicKilometer: {
            cubicMeter: 1e9,
            liter: 1e12,
            milliliter: 1e15,
            cubicKilometer: 1,
            cubicFoot: 35314637.1,
            cubicInch: 61023700000,
            cubicYard: 1307951.2,
            gallon: 2641720520,
            quart: 1056688210,
            pint: 2113376420,
            cup: 4226752840,
            fluidOunce: 33814000000,
            cubicCentimeter: 1e15,cubicMillimeter: 1e18,

        },
        cubicFoot: {
            cubicMeter: 0.0283168,
            liter: 28.3168,
            milliliter: 28316.8,
            cubicKilometer: 2.83168e-10,
            cubicFoot: 1,
            cubicInch: 1728,
            cubicYard: 0.037037,
            gallon: 7.48052,
            quart: 29.9221,
            pint: 59.8442,
            cup: 113.653,
            fluidOunce: 957.506,
            cubicCentimeter: 28316.8,cubicMillimeter: 28316800,

        },
        cubicInch: {
            cubicMeter: 0.0000163871,
            liter: 0.0163871,
            milliliter: 16.3871,
            cubicKilometer: 1.63871e-15,
            cubicFoot: 0.000578704,
            cubicInch: 1,
            cubicYard: 0.0000214335,
            gallon: 0.004329,
            quart: 0.017316,
            pint: 0.034632,
            cup: 0.067628,
            fluidOunce: 0.554113,
            cubicCentimeter: 16.3871,cubicMillimeter: 16387.1,

        },
        cubicYard: {
            cubicMeter: 0.764555,
            liter: 764.555,
            milliliter: 764555,
            cubicKilometer: 7.64555e-10,
            cubicFoot: 27,
            cubicInch: 46656,
            cubicYard: 1,
            gallon: 201.974,
            quart: 807.895,
            pint: 1615.79,
            cup: 32295.7,
            fluidOunce: 268435,
            cubicCentimeter: 764554.85798,cubicMillimeter: 764554857.98,

        },
        gallon: {
            cubicMeter: 0.00378541,
            liter: 3.78541,
            milliliter: 3785.41,
            cubicKilometer: 3.78541e-12,
            cubicFoot: 0.008,
            cubicInch: 231,
            cubicYard: 0.000521,
            gallon: 1,
            quart: 4,
            pint: 8,
            cup: 16,
            fluidOunce: 128,
            cubicCentimeter: 3785.41,cubicMillimeter: 3785410,

        },
        quart: {
            cubicMeter: 0.000946353,
            liter: 0.946353,
            milliliter: 946.353,
            cubicKilometer: 9.46353e-13,
            cubicFoot: 0.002,
            cubicInch: 57.75,
            cubicYard: 0.0001305,
            gallon: 0.25,
            quart: 1,
            pint: 2,
            cup: 4,
            fluidOunce: 32,
            cubicCentimeter: 946.353,cubicMillimeter: 946353,

        },
        pint: {
            cubicMeter: 0.000473176,
            liter: 0.473176,
            milliliter: 473.176,
            cubicKilometer: 4.73176e-13,
            cubicFoot: 0.001,
            cubicInch: 28.875,
            cubicYard: 0.0000653,
            gallon: 0.125,
            quart: 0.5,
            pint: 1,
            cup: 2,
            fluidOunce: 16,
            cubicCentimeter: 473.176,cubicMillimeter: 473176,

        },
        cup: {
            cubicMeter: 0.000236588,
            liter: 0.236588,
            milliliter: 236.588,
            cubicKilometer: 2.36588e-13,
            cubicFoot: 0.0005,
            cubicInch: 14.4375,
            cubicYard: 0.000031,
            gallon: 0.0625,
            quart: 0.25,
            pint: 0.5,
            cup: 1,
            fluidOunce: 8,
            cubicCentimeter: 236.588,cubicMillimeter: 236588,
        },
        fluidOunce: {
            cubicMeter: 0.0000295735,
            liter: 0.0295735,
            milliliter: 29.5735,
            cubicKilometer: 2.95735e-14,
            cubicFoot: 0.000078,
            cubicInch: 1.80469,
            cubicYard: 0.000021,
            gallon: 0.0078125,
            quart: 0.03125,
            pint: 0.0625,
            cup: 0.125,
            fluidOunce: 1,
            cubicCentimeter: 29.5735,cubicMillimeter: 29573.5,
        },
        cubicCentimeter: {
            cubicMeter: 1e-6,
            liter: 0.001,
            milliliter: 1,
            cubicKilometer: 1e-15,
            cubicFoot: 0.0000353147,
            cubicInch: 0.0610237,
            cubicYard: 0.00000130795,
            gallon: 0.000264172,
            quart: 0.00105669,
            pint: 0.00211337,
            cup: 0.00422675,
            fluidOunce: 0.033814,
            cubicCentimeter: 1,
            cubicMillimeter: 1000,
        },
        cubicMillimeter: {
            cubicMeter: 1e-9,
            liter: 1e-6,
            milliliter: 0.001,
            cubicKilometer: 1e-18,
            cubicFoot: 0.0000000353147,
            cubicInch: 0.0000610237,
            cubicYard: 0.00000000130795,
            gallon: 0.000000264172,
            quart: 0.00000105669,
            pint: 0.00000211337,
            cup: 0.00000422675,
            fluidOunce: 0.000033814,
            cubicCentimeter: 0.001,
            cubicMillimeter: 1,
        },        
    },


};
// convert function
function convert(quantityType, baseUnit, targetUnit, value) {
    //Verify if the value is a number or not
    value = Number(value);
    if (isNaN(value)) return;
    let conversionResult = 0;


    // Handle currency conversion
    if (quantityType === 'currency') {
    }

    // Handle temperature conversion
    if (quantityType === 'temperature') {
        if (baseUnit === 'celsius') {
            if (targetUnit === 'fahrenheit') {
                conversionResult = conversionTable.temperature.celsiusToFahrenheit(value);
            }
            if (targetUnit === 'kelvin') {
                conversionResult = conversionTable.temperature.celsiusToKelvin(value);
            }
            if (targetUnit === 'rankine') {
                conversionResult = conversionTable.temperature.celsiusToRankine(value);
            }
            else conversionResult = value;
        }

        if (baseUnit === 'fahrenheit') {
            if (targetUnit === 'celsius') {
                conversionResult = conversionTable.temperature.fahrenheitToCelsius(value);
            }
            if (targetUnit === 'kelvin') {
                conversionResult = conversionTable.temperature.fahrenheitToKelvin(value);
            }
            if (targetUnit === 'rankine') {
                conversionResult = conversionTable.temperature.fahrenheitToRankine(value);
            }
            else conversionResult = value;
        }

        if (baseUnit === 'kelvin') {
            if (targetUnit === 'fahrenheit') {
                conversionResult = conversionTable.temperature.kelvinToFahrenheit(value);
            }
            if (targetUnit === 'celsius') {
                conversionResult = conversionTable.temperature.kelvinToCelsius(value);
            }
            if (targetUnit === 'rankine') {
                conversionResult = conversionTable.temperature.kelvinToRankine(value);
            }
            else conversionResult = value;
        }

        if (baseUnit === 'rankine') {
            if (targetUnit === 'fahrenheit') {
                conversionResult = conversionTable.temperature.rankineToFahrenheit(value);
            }
            if (targetUnit === 'kelvin') {
                conversionResult = conversionTable.temperature.rankineToKelvin(value);
            }
            if (targetUnit === 'celsius') {
                conversionResult = conversionTable.temperature.rankineToCelsius(value);
            }
            else conversionResult = value;
        }
    }

    // Handle other unit conversions
    if (conversionTable[quantityType] && conversionTable[quantityType][baseUnit] && conversionTable[quantityType][baseUnit][targetUnit]) {
        const conversionFactor = conversionTable[quantityType][baseUnit][targetUnit];
        conversionResult = value * conversionFactor;
    } else {
        throw new Error(`Conversion from ${baseUnit} to ${targetUnit} not available in ${quantityType}.`);
    }

    //Show updated result on screen
    document.querySelector(`.${quantityType} .result`).textContent = `${value} ${baseUnit} = ${conversionResult} ${targetUnit}`
}





/* 
  -- UNDO BUTTON --
  Removes the last character from the displayed expression.
*/
document.getElementById("undo").addEventListener("click", () => {
    displayStr = displayStr.slice(0, -1);
    displayText.value = displayStr || "0";
});

/* 
  -- MODE SWITCHING --
  "advanced": show the advanced keypad, including advanced buttons
  "basic": show the keypad but hide advanced buttons
  "keyboard": hide the entire panel (user can type into the display manually)
*/
// Get the select element and the result display element
const modeSelector = document.getElementById("modeSelector");
const advancedButtons = document.querySelector(".advanced-buttons");
const basicButtons = document.querySelector(".basic-buttons")
// Add an event listener for the change event
modeSelector.addEventListener('change', () => {
    // Get the selected value
    const selectedValue = modeSelector.value;
    switch (selectedValue) {
        case 'advanced':
            advancedButtons.classList.remove("panel-hidden");
            basicButtons.classList.remove("panel-hidden")
            break;
        case 'basic':
            advancedButtons.classList.add("panel-hidden");
            basicButtons.classList.remove("panel-hidden")
            break;
        case 'keyboard':
            basicButtons.classList.add("panel-hidden");
            advancedButtons.classList.add("panel-hidden")
            break;
    }
});

/** ----- CONVERSION MODE SELECTOR ------ */

//Quantity changing
let selectedConverter = document.querySelector(".angle");
let selectedFromUnit = document.querySelector(".converter-active .from-unit").value;
let selectedToUnit = document.querySelector(".converter-active .to-unit").value;
const conversionSelector = document.querySelector("#quantitySelector");
let selectedQuantity = conversionSelector.value;
const quantityConverterSet = document.querySelectorAll(".converter-container")
conversionSelector.addEventListener('change', () => {

    selectedConverter.classList.add("converter-hidden");
    selectedConverter.classList.remove("converter-active");
    selectedQuantity = conversionSelector.value;
    quantityConverterSet.forEach(element => {
        if (element.classList.contains(selectedQuantity)) selectedConverter = element;
    });
    selectedConverter.classList.remove("converter-hidden");
    selectedConverter.classList.add("converter-active");
    selectedFromUnit = document.querySelector(".converter-active .from-unit").value;
    selectedToUnit = document.querySelector(".converter-active .to-unit").value;

    convert(selectedQuantity, selectedFromUnit, selectedToUnit, displayStr);
});

//Unit Changing
const setOfFromUnitSelectors = document.querySelectorAll(".from-unit");
setOfFromUnitSelectors.forEach(element => {
    element.addEventListener('change', () => {
        selectedFromUnit = document.querySelector(".converter-active .from-unit").value;
        convert(selectedQuantity, selectedFromUnit, selectedToUnit, displayStr);
    });
});
const setOfToUnitSelectors = document.querySelectorAll(".to-unit");
setOfToUnitSelectors.forEach(element => {
    element.addEventListener('change', () => {
        selectedToUnit = document.querySelector(".converter-active .to-unit").value;
        convert(selectedQuantity, selectedFromUnit, selectedToUnit, displayStr);
    });
});

const inputText = document.getElementById('displayText');
inputText.addEventListener('input', () => {
    convert(selectedQuantity, selectedFromUnit, selectedToUnit, displayStr);
});

const unitSwitchBtns = document.querySelectorAll('.switch-btn');
unitSwitchBtns.forEach(switchBtn => {
    switchBtn.addEventListener('click', () => {
        let temp = selectedFromUnit;
        document.querySelector(".converter-active .from-unit").value = selectedToUnit;
        selectedFromUnit = selectedToUnit;
        
        document.querySelector(".converter-active .to-unit").value = temp;
        selectedToUnit = temp;
        
        convert(selectedQuantity, selectedFromUnit, selectedToUnit, displayStr);
    })
})






