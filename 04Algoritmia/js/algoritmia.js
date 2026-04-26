function problema1() {
    var input = document.querySelector("#p1-input").value.trim();
    var output = document.querySelector("#p1-output");

    if (input === "") {
        output.textContent = "Error: debes ingresar al menos una palabra.";
        return;
    }

    // Validar que solo haya palabras separadas por espacios
    // y que no existan dobles espacios innecesarios.
    var palabras = input.split(" ").filter(function (palabra) {
        return palabra.trim() !== "";
    });

    if (palabras.length === 0) {
        output.textContent = "Error: el texto ingresado no es válido.";
        return;
    }

    palabras.reverse();

    output.textContent = "Resultado:\n" + palabras.join(" ");
}

function problema2() {
    var idsX = ["#p2-x1", "#p2-x2", "#p2-x3", "#p2-x4", "#p2-x5"];
    var idsY = ["#p2-y1", "#p2-y2", "#p2-y3", "#p2-y4", "#p2-y5"];
    var output = document.querySelector("#p2-output");

    var v1 = [];
    var v2 = [];

    for (var i = 0; i < idsX.length; i++) {
        var valorX = document.querySelector(idsX[i]).value.trim();
        var valorY = document.querySelector(idsY[i]).value.trim();

        if (valorX === "" || valorY === "") {
            output.textContent = "Error: todos los campos deben tener un valor.";
            return;
        }

        v1.push(Number(valorX));
        v2.push(Number(valorY));
    }

    if (v1.some(function (num) { return isNaN(num); }) || v2.some(function (num) { return isNaN(num); })) {
        output.textContent = "Error: solo se permiten números válidos.";
        return;
    }

    // Para obtener el mínimo producto escalar:
    // ordenar un vector de menor a mayor y el otro de mayor a menor.
    v1.sort(function (a, b) { return a - b; });
    v2.sort(function (a, b) { return b - a; });

    var producto = 0;
    var pasos = "";

    for (var j = 0; j < v1.length; j++) {
        producto += v1[j] * v2[j];
        pasos += v1[j] + " × " + v2[j] + " = " + (v1[j] * v2[j]) + "\n";
    }

    output.textContent = "Vectores ordenados:\nX = [" + v1.join(", ") + "]\nY = [" + v2.join(", ") + "]\n\n" +
        "Operaciones:\n" + pasos +
        "\nProducto escalar mínimo: " + producto;
}

function problema3() {
    var input = document.querySelector("#p3-input").value.trim();
    var output = document.querySelector("#p3-output");

    if (input === "") {
        output.textContent = "Error: debes ingresar al menos una palabra.";
        return;
    }

    // No se aceptan espacios
    if (input.indexOf(" ") !== -1) {
        output.textContent = "Error: no se permiten espacios. Separa las palabras solo con comas.";
        return;
    }

    var palabras = input.split(",");

    if (palabras.length === 0) {
        output.textContent = "Error: formato inválido.";
        return;
    }

    var mejorPalabra = "";
    var maxUnicos = -1;
    var detalle = "";

    for (var i = 0; i < palabras.length; i++) {
        var palabra = palabras[i].trim();

        if (palabra === "") {
            output.textContent = "Error: no dejes palabras vacías entre comas.";
            return;
        }

        // Validar que solo tenga letras mayúsculas A-Z
        if (!/^[A-Z]+$/.test(palabra)) {
            output.textContent = "Error: solo se aceptan palabras en mayúsculas con letras A-Z.";
            return;
        }

        var letrasUnicas = [];
        for (var j = 0; j < palabra.length; j++) {
            if (letrasUnicas.indexOf(palabra[j]) === -1) {
                letrasUnicas.push(palabra[j]);
            }
        }

        var cantidadUnicos = letrasUnicas.length;
        detalle += palabra + " = " + cantidadUnicos + " (" + letrasUnicas.join(", ") + ")\n";

        if (cantidadUnicos > maxUnicos) {
            maxUnicos = cantidadUnicos;
            mejorPalabra = palabra;
        }
    }

    output.textContent = "Análisis:\n" + detalle + "\nLa palabra con más caracteres únicos es: " + mejorPalabra +
        "\nCantidad de caracteres únicos: " + maxUnicos;
}