$(function(){
    // REINICIO LOS INPUTS				
    $(':input').val('');
    
    // CARGO EL JSON
    var p;
    $.getJSON('perfiles.json?v=1.2').done(function( data ) {
        p = data;
        
        // relleno los rasgos
        $.each( p.rasgos, function(i,e){
            $('#rasgos').append('<option>'+e+'</option>')
        });
        
        // relleno los tipos de unidades
        $.each( p.categorias, function(i,e){
            $('#tipoUnidad').append('<optgroup label="'+e.grupo+'"></optgroup>');
            $.each( e.unidades, function(si,se){
                $('#tipoUnidad optgroup:last').append('<option value="'+se+'">'+p.unidades[se].tipo+'</option>');
            });
        });
        
    }).fail(function() {
        alert( "ERROR JSON" );
    });
    
    // DIFERENCIO LAS UNIDADES
    var identificador = 0;
    
    // EVENTOS DELEGADOS PARA ELEMENTOS DINÁMICOS
    $('main').on('click', '.borrarUnidad', function(){
        $(this).parents('.ficha').fadeOut(function(){
            // elimino la ficha
            $(this).remove();
            
            // recalculo los totales
            total ();
            
            // valido las reglas de creación de ejército
            validaEjercito ();
        });
    });
    
    $('main').on('click', '.subirUnidad', function(){
        subir($(this).closest('.ficha').attr('id'));
    });
    
    $('main').on('click', '.bajarUnidad', function(){
        bajar($(this).closest('.ficha').attr('id'));
    });
    
    // FUNCIÓN DE CARGA DE DATOS
    function cargaDatos(perfil,id){
        var i = perfil;
        var f = $('main #ficha'+id);
        
        f.data('tipo', i);
        f.data('puntos', p.unidades[i].puntos);
        f.find('.nuevaOpcion').data('tipo', i);
        if ( f.find('.nombreUnidad').val() == "") {
            f.find('.nombreUnidad').val( p.unidades[i].tipo );
        }
        f.find('.puntosUnidad').val( p.unidades[i].puntos );
        f.find('.combate').html( p.unidades[i].combate );
        f.find('.valorCombate').html( p.unidades[i].valorCombate );
        f.find('.movimiento').html( p.unidades[i].movimiento );
        f.find('.valorDefensa').html( p.unidades[i].valorDefensa );
        f.find('.disparo').html( p.unidades[i].disparo );
        f.find('.valorDisparo').html( p.unidades[i].valorDisparo );
        f.find('.coraje').html( p.unidades[i].coraje );
        f.find('.movimientoMaximo').html( p.unidades[i].movimientoMaximo );
        f.find('.armadura').html( p.unidades[i].armadura );
        f.find('.fuerza').html( p.unidades[i].fuerza );
        f.find('.reglasEspeciales').html( p.unidades[i].reglasEspeciales.join(", ") );
        
    }
    
    // FUNCIÓN PARA RECALCULAR EL TOTAL DE PUNTOS
    function total () {
        // recalculo los totales
        var t = 0;
        $( 'main .ficha' ).each(function(i) {
            t += parseInt( $( this ).find('.puntosUnidad').val() );
        });
        $('#puntosTotales').val(t);
    }
    
    // FUNCIÓN PARA VALIDAR LAS CONDICIONES DEL EJÉRCITOS
    // de 4 a 10 unidades, de entre 1 y 10 puntos de fuerza cada una
    function validaEjercito () {
        var totalPuntos = parseInt( $('#puntosTotales').val() );
        var totalUnidades = $('main .ficha').length;
        var arrayOpciones;
        var totalLider = 0;
        var controlUnidades = true;
        var controlPuntos = true;
        
        // cuento el total de unidades Lider
        $('main .ficha').each(function(){
            if ( $(this).find('.opciones').data('opciones') != "" ) {
                arrayOpciones = $(this).find('.opciones').data('opciones').split('|');
                if ( arrayOpciones.indexOf('0') != -1 ) {
                    totalLider ++;
                }
            } 
        });
        
        // reviso que no esté fuera del rango de unidades
        if ( totalUnidades > 10 || totalUnidades < 4 ) {
            controlUnidades = false;
        }
        
        // reviso que cada unidad no esté fuera del rango de puntos 
        $('main .ficha').each(function(){
            if ( parseFloat($(this).find('.puntosUnidad').val()) > 10 || parseFloat($(this).find('.puntosUnidad').val()) < 1 ) {
                controlPuntos = false;
                $(this).find('.puntosUnidad').addClass('is-invalid text-danger');
            } else {
                $(this).find('.puntosUnidad').removeClass('is-invalid text-danger');
            }
        });
        
        // muestro los errores
        $('#avisoErrores').html('');
        if ( !controlUnidades || !controlPuntos || totalLider != 1 ) {
            $('#avisoErrores').parents('.alert').removeClass('alert-info').addClass('alert-danger');
            $('#avisoErrores').parents('.alert').find('.fad').removeClass('fa-info-circle').addClass('fa-exclamation-triangle');
            if ( !controlUnidades ) {
                $('#avisoErrores').append('<strong class="d-block">Tienes '+totalUnidades+' unidades</strong>');
            }
            if ( !controlPuntos ) {
                $('#avisoErrores').append('<strong class="d-block">Tienes unidades fuera del rango de puntos</strong>');
            }
            if ( totalLider > 1 ) {
                $('#avisoErrores').append('<strong class="d-block">Tienes '+totalLider+' unidades Lider</strong>');
            }
            if ( totalLider < 1 ) {
                $('#avisoErrores').append('<strong class="d-block">Debes tener una unidad Lider</strong>');
            }						
        } else {
            $('#avisoErrores').parents('.alert').removeClass('alert-danger').addClass('alert-info');
            $('#avisoErrores').parents('.alert').find('.fad').removeClass('a-exclamation-triangle').addClass('fa-info-circle');
        }
    }
    
    // FUNCIÓN PARA SUBIR UNIDAD
    function subir (id) {
        //$('#'+id).prev().before( $('#'+id) );					
        $('#'+id).insertBefore( $('#'+id).prev() );
    }
    
    // FUNCIÓN PARA BAJAR UNIDAD
    function bajar (id) {
        //$('#'+id).next().after( $('#'+id) );
        $('#'+id).insertAfter( $('#'+id).next() );
    }
    
    // FUNCIÓN PARA AÑADIR NUEVA UNIDAD
    function unidad (i,p) {
        // añado la nueva ficha vacía oculta
        if ( p == 'inicio' ) {
            $('main').prepend( $('.plantilla').html() );
            var f = $('main .ficha:first');
        } else {
            $('main').append( $('.plantilla').html() );
            var f = $('main .ficha:last');
        }
        
        f.hide();
        
        // cargo el nombre de la unidad
        f.find('.nombreUnidad').val( $('#nombreUnidad').val() );

        // asigno identificador
        identificador ++;
        f.data('identificador', identificador);
        f.attr('id', 'ficha'+identificador);
        f.find('.nuevaOpcion').data('identificador', identificador);
        
        // cargo el contenido
        cargaDatos(i,identificador);
        
        f.fadeIn();
        
        return identificador;
    }
    
    // EVENTO AÑADIR NUEVA UNIDAD
    $(document).on('click', '#nuevaUnidad', function(){
        var i = $('#tipoUnidad').val();
        if ( i != "" ) {
            // genero la ficha de unidad
            unidad (i,'inicio');
            
            // reseteo el formulario y muestro la ficha
            $('#nombreUnidad').val('');
            $('#tipoUnidad option:first').prop('selected',true);						
        
            // recalculo los totales
            total ();
            
            // valido las reglas de creación de ejército
            validaEjercito ();
            
        } // if
    });

    // MODIFICAR EL MODAL DE LAS OPCIONES DE LA UNIDAD
    $('#nuevaOpcion').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        var tipoUnidad = button.data('tipo');
                            
        if ( button.parents('.ficha').find('.opciones').data('opciones') != ""){
            var arrayOpciones = button.parents('.ficha').find('.opciones').data('opciones').split('|');
        } else {
            var arrayOpciones = [];
        }
        
        if ( button.parents('.ficha').find('.opciones').data('magia') != ""){
            var arrayMagia = button.parents('.ficha').find('.opciones').data('magia').split('|');
        } else {
            var arrayMagia = [];
        }
                            
        var identificador = button.data('identificador');
        var modal = $(this);
                                                
        modal.find('#aplicarOpciones').data('identificador',identificador);
        modal.find('#opcionesUnidad').html(function(){
            // cargo las opciones de la unidad
            var temp = '';										  
            $.each( p.unidades[tipoUnidad].opciones, function(tipo,elemento){
                temp += '<div class="col-6 col-md-3 py-2 ">';
                    temp += '<div class="form-check">';
                        temp += '<input type="checkbox" class="form-check-input opcionUnidad" id="opcionUnidad'+tipo+'" data-opcion="'+tipo+'" data-coste="'+elemento.coste+'" data-titulo="'+elemento.titulo+'" ';
                        if ( arrayOpciones.indexOf(tipo.toString()) != -1 ) {
                            temp += 'checked ';
                        }
                        temp += ' val="'+tipo+'">';
                        temp += '<label class="form-check-label" for="opcionUnidad'+tipo+'">';
                            temp += elemento.titulo + ' (' + elemento.coste + ')';
                        temp += '</label>';
                    temp += '</div>';
                temp += '</div>';
            });
            return temp;
        });
        modal.find('#opcionesMagicas').html(function(){
            // cargo las opciones mágicas de la unidad
            var temp = '';
            $.each( p.magia, function(tipo,elemento){
                if ( p.unidades[tipoUnidad].magia.indexOf( elemento.titulo ) < 0  ) {
                    temp += '<div class="col-6 col-md-3 py-2 ">';
                        temp += '<div class="form-check">';
                            temp += '<input type="checkbox" class="form-check-input opcionMagica" id="opcionMagica'+tipo+'" data-opcion="'+tipo+'" data-coste="'+elemento.coste+'" data-titulo="'+elemento.titulo+'" ';
                        if ( arrayMagia.indexOf(tipo.toString()) != -1 ) {
                            temp += 'checked ';
                        }
                        temp += ' val="'+tipo+'">';
                            temp += '<label class="form-check-label" for="opcionMagica'+tipo+'">';
                                temp += elemento.titulo + ' (' + elemento.coste + ')';
                            temp += '</label>';
                        temp += '</div>';
                    temp += '</div>';
                }
            });
            return temp;
        });
    });
    
    // EVENTO BOTÓN AÑADIR OPCIONES
    $(document).on('click', '#aplicarOpciones', function(){
        var t = 0;
        var opciones = [];
        var magia = [];
        var titulos = [];
        var identificador = $(this).data('identificador');
        var f = $('main #ficha'+identificador);
        var tipo = f.data('tipo');
        var reglas = [];
        // añado las reglas especiales de la unidad de forma individual para eviyar sobreescribir los datos originales
        $.each(p.unidades[tipo].reglasEspeciales, function(i,e){
            reglas.push(e);
        });
        
        // recargo el contenido
        cargaDatos(tipo,identificador);
        
        // recorro los checkbox				
        $( '#nuevaOpcion #opcionesUnidad input:checked' ).each(function(i) {			
            t += parseFloat( $( this ).data('coste') );
            opciones.push( $( this ).data('opcion') );
            titulos.push( $( this ).data('titulo') );
        });
        $( '#nuevaOpcion #opcionesMagicas input:checked' ).each(function(i) {
            t += parseFloat( $( this ).data('coste') );
            magia.push( $( this ).data('opcion') );
            titulos.push( $( this ).data('titulo') );
        });
        
        // añado las opciones a los data
        if ( opciones.length > 0 ){
            f.find('.opciones').data('opciones', opciones.join('|') );
            
            // modifico las Reglas especiales y Atributos
            $.each( opciones, function(i,e){
                var opcionTemp = p.unidades[tipo].opciones[e];
                
                
                if ( opcionTemp.reemplaza.length > 0 ) {
                    $.each(opcionTemp.reemplaza, function (si,se){
                        var posicion = reglas.indexOf(se);
                        if ( posicion != -1 ){
                            reglas.splice(posicion, 1);
                        }
                    });
                }
                
                
                if ( opcionTemp.modifica.length > 0  ) {
                    $.each(opcionTemp.modifica, function (si,se){
                        f.find('.'+se.atributo).html( se.valor );
                    });
                }
                
            });
        } else {
            f.find('.opciones').data('opciones', '' );
        }
        f.find('.reglasEspeciales').html( reglas.join(", ") );
        
        if ( magia.length > 0 ){
            f.find('.opciones').data('magia', magia.join('|') );
        } else {
            f.find('.opciones').data('magia', '' );
        }
        f.find('.opciones').text( titulos.join(', ') );
                            
        // recalculo los totales
        f.find('.puntosUnidad').val( parseInt(f.data('puntos')) + t );
        total ();
        
        // valido las reglas de creación de ejército
        validaEjercito ();
        
        // borro datos
        $(this).data('identificador','');
        
        // cierro el modal
        $('#nuevaOpcion').modal('hide');
        
    });
    
    // EVENTO BOTÓN PARA IMPRIMIR
    $(document).on('click', '#imprimir', function(){
        window.print();
    });
    
    // EVENTO BOTÓN PARA IMPORTAR
    $(document).on('click', '#btnImportar', function(){
        var t = JSON.parse( $('#importar').val().trim() );
        var id, f;

        // cargo los perfiles
        $.each( t.unidades, function(i,e){
            id = unidad(e.unidad,'final');
            f = $('#ficha'+id);
            f.find('.nombreUnidad').val(e.nombre);
            f.find('.puntosUnidad').val(e.puntos);
            f.find('.opciones').data('opciones',e.opciones);
            f.find('.opciones').data('magia',e.magia);
            
            var opciones = e.opciones.split('|');
            var magia = e.magia.split('|');
            var titulos = [];
            var reglas = [];
            // añado las reglas especiales de la unidad de forma individual para eviyar sobreescribir los datos originales
            $.each(p.unidades[e.unidad].reglasEspeciales, function(si,se){
                reglas.push(se);
            });
            
            // añado las opciones
            if ( e.opciones != '' ) {
                $.each (opciones, function(si,se){
                    titulos.push( p.unidades[e.unidad].opciones[se].titulo );

                    // modifico las Reglas especiales y Atributos
                    var opcionTemp = p.unidades[e.unidad].opciones[se];
                    if ( opcionTemp.reemplaza.length > 0 ) {
                        $.each(opcionTemp.reemplaza, function (ssi,sse){
                            var posicion = reglas.indexOf(sse);
                            if ( posicion != -1 ){
                                reglas.splice(posicion, 1);
                            }
                        });
                    }
                    
                    if ( opcionTemp.modifica.length > 0  ) {
                        $.each(opcionTemp.modifica, function (ssi,sse){
                            f.find('.'+sse.atributo).html( sse.valor );
                        });
                    }
                
                });
            }
            f.find('.reglasEspeciales').html( reglas.join(", ") );
            
            // añado la magia
            if ( e.magia != '' ) {
                $.each (magia, function(si,se){
                    titulos.push( p.magia[se].titulo);
                });
            }
            
            f.find('.opciones').text( titulos.join(', ') );

        });	
        
        // muestro la información
        $('#companiaInfo').val(t.descripcion[0].compania);
        $('#liderInfo').val(t.descripcion[0].lider);
        $('#puntosTotales').val(t.descripcion[0].puntos);
        $('#rasgos').val(t.descripcion[0].rasgo);
        
        // vacío la caja
        $('#importar').val('');
        
        // cierro el modal
        $('#reciclar').modal('hide')
        
        // vacío el nombre del archivo
        $('label[for="importarArchivo"]').text('Selecciona archivo');
        
        // recalculo los totales
        total ();
        
        // valido las reglas de creación de ejército
        validaEjercito ();					
        
    });
    
    // CARGAR UN ARCHIVO JSON DE IMPORTACIÓN
    $(document).on('change', '#importarArchivo', function(){
        var archivo = $(this)[0].files[0]; // selecciono el archivo subido
        $('label[for="importarArchivo"]').text(archivo.name);
        var lector = new FileReader(); // creo el objeto FileReader
        lector.onload = function(e) { // el método onload se ejecuta cuando se acaba de leer el archivo
            $('#importar').val(e.target.result); // muestro el contenido del archivo
        }
        lector.readAsText(archivo); // leo el archivo
    });
    
    // EVENTO COPIAR EXPORTACIÓN
    $(document).on('mouseup', '#exportar', function() {
        var $element = $(this);
        var text = $element.text();
        
        // Usar Clipboard API (moderna)
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(function() {
                $element.attr('title','¡Copiado!');
                $element.tooltip('show');
            }).catch(function(err) {
                console.error('Error al copiar:', err);
                $element.attr('title','No se puede copiar');
                $element.tooltip('show');
            });
        } else {
            // Fallback para navegadores antiguos
            var textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                $element.attr('title','¡Copiado!');
                $element.tooltip('show');
            } catch (err) {
                console.error('Error al copiar:', err);
                $element.attr('title','No se puede copiar');
                $element.tooltip('show');
            }
            
            document.body.removeChild(textArea);
        }
    });
    $('#exportar').on('hidden.bs.tooltip', function () {
        $(this).tooltip('disable');
    });
    $(document).on('click', '#btnExportar', function(){
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent( $('#exportar').text() );
        $(this).attr('download',$('#companiaInfo').val()+'.json');
        $(this).attr('href',dataStr);
    });

    // MODIFICAR EL MODAL DE EXPORTAR
    $('#reciclar').on('show.bs.modal', function (event) {
        var t = '{"unidades":[';
        $( 'main .ficha' ).each(function(i) {
            if ( t != '{"unidades":[' )
                t += ',';
            t += '{';
                t += '"unidad":"'+$(this).data('tipo')+'",';
                t += '"nombre":"'+$(this).find('.nombreUnidad').val()+'",';
                t += '"puntos":"'+$(this).find('.puntosUnidad').val()+'",';
                t += '"opciones":"'+$(this).find('.opciones').data('opciones')+'",';
                t += '"magia":"'+$(this).find('.opciones').data('magia')+'"';
            t += '}';
        });
        t += '],';
        t += '"descripcion":[{';
            t += '"compania":"'+$('#companiaInfo').val()+'",';
            t += '"lider":"'+$('#liderInfo').val()+'",';
            t += '"puntos":"'+$('#puntosTotales').val()+'",';
            t += '"rasgo":"'+$('#rasgos').val()+'"';
        t += '}]';
        t += '}';
        $('#exportar').text(t);
        
    });
    
});
