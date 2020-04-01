
var sortAscending = true;
var table = d3.select("#wrapper").append("table").attr("id", "table");

var rows;

const drawHeaders = function(targetData, multiplenest) {

    d3.select("thead").remove();
    const tableHead = table.append('thead');

    const headers_title = [
        {"name": "Назва", "correspond": "title"},
        {"name": "К-ть голосів", "correspond": "engaged_number"},
        {"name": "Бюджет", "correspond": "collected_amount"},
        {"name": "Тип капіталу", "correspond": "capital"},
        {"name": multiplenest, "correspond": multiplenest},
        {"name": "Платформа", "correspond": multiplenest},
        {"name": "Рік", "correspond": "any_date"},
        {"name": "Успішність", "correspond": "status"}
    ];

    const headers =  tableHead.append('tr')
        .selectAll('th')
        .data(["Назва", "Платформа", "Тип капіталу", "Бюджет", "К-ть голосів", "Рік"])
        .enter()
        .append('th')
        .attr("data-th", function (d) {  return d  });

    //назва колонки
    headers.append("p")
        .text(function (d) {
            return d
        })
        .on('click', function (d) {
            let text = d3.select(this).text();
            let selectedAttr = headers_title.filter(function(t){ return t.name === text});
            headers.attr('class', 'header');
            d3.selectAll("tr").attr('style', null);
            if (sortAscending) {
                rows.sort(function(a, b) {
                    if(selectedAttr[0].correspond === "collected_amount" ||
                        selectedAttr[0].correspond === "engaged_number") {
                        return b[selectedAttr[0].correspond] - a[selectedAttr[0].correspond];
                    } else {
                        return d3.ascending(b[selectedAttr[0].correspond], a[selectedAttr[0].correspond]);
                    }
                });
                getPagination('table');
                sortAscending = false;
                this.className = 'aes';
            }
            else {
                rows.sort(function(a, b) {
                    if(selectedAttr[0].correspond === "collected_amount" ||
                        selectedAttr[0].correspond === "engaged_number") {
                        return a[selectedAttr[0].correspond] - b[selectedAttr[0].correspond];
                    } else {
                        return d3.descending(b[selectedAttr[0].correspond], a[selectedAttr[0].correspond]);
                    }
                });
                getPagination('table');
                sortAscending = true;
                this.className = 'des';
            }
        });

    d3.selectAll('th')
        .each(function(header) {
            if(header === "platform" || header === "location"|| header === "Платформа" || header === "Тип капіталу" || header === "Рік") {
                const currentNode = this;
                //кнопочка +
                d3.select(this)
                    .append("h3")
                    .text(window.innerWidth > 760 ?"+": "×")
                    .on("click", function(){
                        d3.select(currentNode).select("select").attr('size', window.innerWidth > 760 ? 5: 1);
                        d3.select(currentNode).select("select").classed("hidden",  function() {
                            return !this.classList.contains("hidden")
                        });
                        $(currentNode).find("select").prop('selectedIndex', -1);
                        checkSelected(targetData, multiplenest);

                        if(d3.select(currentNode).select("select").classed("hidden")){
                            d3.select(this).text("+");
                        } else {
                            d3.select(this).text("×");
                        }




                    });

                let selectedAttr = headers_title.filter(function(t){ return t.name === header});
                var buckets = [...new Set(targetData.map(function(d) { return d[selectedAttr[0].correspond]}))];
                //buckets.push("прибрати фільтр");
                buckets.sort(function(a, b){ return d3.ascending(b, a);});

                //select
                var select = d3.select(this)
                    .append("select")
                    .attr("id", function() { return  selectedAttr[0].correspond != multiplenest ? selectedAttr[0].correspond : "platform"})
                    .attr("class", window.innerWidth > 760 ? "hidden": "" )
                    .attr('size', window.innerWidth > 760 ? 5: 1)
                    .on("change", function(e){
                        $(this).attr("size", 1);
                        //var selectedOption = this.options[this.selectedIndex].value;
                        checkSelected(targetData, multiplenest);
                        //         $("#table td.platform:contains('" + selectedOption + "')").parent().show();
                        //         $("#table td.platform:not(:contains('" + selectedOption + "'))").parent().hide();

                    });



                select.selectAll("option")
                    .data(buckets)
                    .enter()
                    .append("option")
                    .text(function(d){ return d; })
                    .attr("value", function(d){ return d != "прибрати фільтр"?d:""; });
                }
            });
};



const drawTable = function (targetData, multiplenest) {
    targetData.forEach(function (d) {
        d.collected_amount = +d.collected_amount;
        d.engaged_number = +d.engaged_number;
    });

    d3.select("tbody").remove();
    const tableBody = table.append('tbody');

    //table body
    rows = tableBody.selectAll('tr')
        .data(targetData)
        .enter()
        .append('tr');


    rows.append("td")
        .attr("data-th", "Назва")
        .text(function (d) {
            return d.title.replace('^"', '');
        });

    rows.append('td')
        .attr("data-th", multiplenest)
        .attr("class", "platform")
        .text(function (d) {
            return d[multiplenest];
        });


    rows.append('td')
        .attr("data-th", "Тип капіталу")
        .attr("class", "capital")
        .text(function (d) {
            return d.capital
        });

    rows.append('td')
        .attr("data-th", "Бюджет")
        .text(function (d) {
            return d.collected_amount;
        });

    rows.append('td')
        .attr("data-th", "К-ть голосів")
        .attr("class", "flex-mobile")
        .text(function (d) {
            return d.engaged_number;
        });

    rows.append('td')
        .attr("data-th", "Рік")
        .attr("class", "year")
        .text(function (d) {
            return d.any_date;
        });

    // rows.append('td')
    //     .attr("data-th", "Успішність")
    //     .attr("class", "status")
    //     .text(function (d) {
    //         return d.status;
    //     });

    getPagination('table');
};


 function getPagination(table) {
     var lastPage = 1;
     $('.pagination')
         .find('li')
         // .slice(1, -1)
         .remove();

     var trnum = 0;
     var maxRows = 20;

     var totalRows = $(table + ' tbody tr').length; // numbers of rows
     $(table + ' tr').each(function() {
         trnum++;
         if (trnum > maxRows) {
             $(this).hide();
         }
         if (trnum <= maxRows) {
             $(this).show();
         }
     });
     if (totalRows > maxRows) {
         var pagenum = Math.ceil(totalRows / maxRows);
         for (var i = 1; i <= pagenum; ) {
             $('.pagination')
                 .append(
                     '<li data-page="' + i + '"> <span>' +    i++ +
                     '<span class="sr-only"></span></span></li>')
                 .show();
         }
     }
     $('.pagination [data-page="1"]').addClass('active');
     $('.pagination li').on('click', function(evt) {
         evt.stopImmediatePropagation();
         evt.preventDefault();
         var pageNum = $(this).attr('data-page');

         var maxRows = 20;

         if (pageNum == 'prev') {
             if (lastPage == 1) {
                 return;
             }
             pageNum = --lastPage;
         }
         if (pageNum == 'next') {
             if (lastPage == $('.pagination li').length - 2) {
                 return;
             }
             pageNum = ++lastPage;
         }

         lastPage = pageNum;
         var trIndex = 0; //
         $('.pagination li').removeClass('active');
         $('.pagination [data-page="' + lastPage + '"]').addClass('active');
         limitPagging();
         $(table + ' tr:gt(0)').each(function() {
             trIndex++;
             if (
                 trIndex > maxRows * pageNum ||
                 trIndex <= maxRows * pageNum - maxRows
             ) {
                 $(this).hide();
             } else {
                 $(this).show();
             }
         });
     });
     limitPagging();
 }

 function limitPagging(){
     if($('.pagination li').length > 7 ){
         if( $('.pagination li.active').attr('data-page') <= 3 ){
             $('.pagination li:gt(5)').hide();
             $('.pagination li:lt(5)').show();
             $('.pagination [data-page="next"]').show();
         }if ($('.pagination li.active').attr('data-page') > 3){
             $('.pagination li:gt(0)').hide();
             $('.pagination [data-page="next"]').show();
             for( var i = ( parseInt($('.pagination li.active').attr('data-page'))  -2 )  ; i <= ( parseInt($('.pagination li.active').attr('data-page'))  + 2 ) ; i++ ){
                 $('.pagination [data-page="'+i+'"]').show();
             }
         }
     }
 }


//перемальовуємо таблицю, після селекту
const checkSelected = function(targetData, multiplenest){
    var capitalCol =  document.getElementById("capital");
    var capitalColVal = capitalCol.selectedIndex >= 0 ? capitalCol.options[capitalCol.selectedIndex].value : null;


    var platformCol = document.getElementById("platform");
    var platformColVal = platformCol.selectedIndex >= 0 ? platformCol.options[platformCol.selectedIndex].value : null;

    var yearCol = document.getElementById("any_date");
    var yearColVal = yearCol.selectedIndex >= 0? yearCol.options[yearCol.selectedIndex].value : null;

    // var statusCol = document.getElementById("statusCol");
    // var statusColVal = statusCol.selectedIndex >= 0? statusCol.options[statusCol.selectedIndex].value : null;

    if(capitalColVal && yearColVal && platformColVal){
        let table_data = targetData.filter(function(d){
            return d.capital === capitalColVal && d[multiplenest] === platformColVal && d.any_date === yearColVal
        });
        drawTable(table_data, multiplenest);
        getPagination('table');
    } else if(capitalColVal && yearColVal){
        let table_data = targetData.filter(function(d){
            return d.capital === capitalColVal && d.any_date === yearColVal
        });
        drawTable(table_data, multiplenest);
        getPagination('table');
    } else if(capitalColVal && platformColVal){
        let table_data = targetData.filter(function(d){
            return d.capital === capitalColVal && d[multiplenest] === platformColVal
        });
        drawTable(table_data, multiplenest);
        getPagination('table');
    } else if(yearColVal && platformColVal){
        let table_data = targetData.filter(function(d){
            return d[multiplenest] === platformColVal && d.any_date === yearColVal
        });
        drawTable(table_data, multiplenest);
        getPagination('table');
    } else if(capitalColVal) {
        let table_data = targetData.filter(function(d){
            return d.capital === capitalColVal
        });
        drawTable(table_data, multiplenest);
        getPagination('table');
    }  else if(yearColVal){
        let table_data = targetData.filter(function(d){
            return d.any_date === yearColVal
        });
        drawTable(table_data, multiplenest);
        getPagination('table');
    } else if(platformColVal){
        let table_data = targetData.filter(function(d){
            return d[multiplenest] === platformColVal
        });
        drawTable(table_data, multiplenest);
        getPagination('table');
    } else if(!capitalColVal && !yearColVal && !platformColVal){
        drawTable(targetData, multiplenest);
        getPagination('table');
    }

};













