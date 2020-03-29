
var sortAscending = true;
var table = d3.select("#wrapper").append("table").attr("id", "table");

var tableHead = table.append('thead');
var rows;

const drawHeaders = function(targetData, multiplenest) {
    // targetData.forEach(function(d){
    //     d.any_date = +d.any_date;
    // });

    const headers_title = [
        {"name": "Назва", "correspond": "title"},
        {"name": "К-ть голосів", "correspond": "engaged_number"},
        {"name": "Бюджет", "correspond": "collected_amount"},
        {"name": "Тип капіталу", "correspond": "capital"},
        {"name": multiplenest, "correspond": multiplenest},
        {"name": "Рік", "correspond": "any_date"}
    ];

    const headers =  tableHead.append('tr')
        .selectAll('th')
        .data(["Назва", multiplenest, "Тип капіталу", "Бюджет", "К-ть голосів", "Рік"])
        .enter()
        .append('th')
        .attr("data-th", function (d) {  return d  });

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
                        selectedAttr[0].correspond === "engaged_number" ||
                        selectedAttr[0].correspond === "any_date") {
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
                        selectedAttr[0].correspond === "engaged_number" ||
                        selectedAttr[0].correspond === "any_date") {
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
            if(header === "platform" || header === "location"|| header === "Тип капіталу" || header === "Рік") {
                const currentNode = this;
                d3.select(this)
                    .append("button")
                    .text("+")
                    .on("click", function(){
                        d3.select(currentNode).select("select").classed("hidden",  function() { return !this.classList.contains("hidden")})

                    });

                let selectedAttr = headers_title.filter(function(t){ return t.name === header});
                var buckets = [...new Set(targetData.map(function(d) { return d[selectedAttr[0].correspond]}))];

                buckets.push("прибрати фільтр");

                var select = d3.select(this)
                    .append("select")
                    .attr("id", selectedAttr[0].correspond)
                    .attr("class", "hidden")
                    .attr('size', 5)
                    .on("change", function(e){
                        $(this).attr("size", 1);
                        var selectedOption = this.options[this.selectedIndex].value;
                        if(selectedOption != "прибрати фільтр") {
                            let table_data = targetData.filter(function(d){
                                return d[selectedAttr[0].correspond] === selectedOption
                            });
                            drawT(table_data, multiplenest);
                            getPagination('table');
                        }

                        // var capitalCol =  document.getElementById("capital");
                        // var capitalColVal = capitalCol.options[capitalCol.selectedIndex].value;
                        // console.log(capitalColVal);
                        //
                        // var yearCol = document.getElementById("any_date");
                        // var yearColVal = yearCol.options[yearCol.selectedIndex].value;
                        // console.log(yearColVal);
                        //
                        // var platformCol = document.getElementById("platform");
                        // var platformColVal = platformCol.options[platformCol.selectedIndex].value;
                        // console.log(platformColVal);

                        // if(capitalColVal && yearColVal && platformColVal){
                        //     console.log(capitalColVal);
                        //     console.log(yearColVal);
                        //     console.log(platformColVal);
                        // } else if(capitalColVal && yearColVal){
                        //     console.log(capitalColVal);
                        //     console.log(yearColVal);
                        // } else if(capitalColVal && platformColVal){
                        //     console.log(capitalColVal);
                        //     console.log(platformColVal);
                        // } else if(yearColVal && platformColVal){
                        //     console.log(yearColVal);
                        //     console.log(platformColVal);
                        // } else if(capitalColVal) {
                        //     console.log(capitalColVal);
                        // }  else if(yearColVal){
                        //     console.log(yearColVal);
                        // } else if(platformColVal){
                        //     console.log(platformColVal);
                        //
                        // }


                        // if(selectedOption != "прибрати фільтр") {
                        //     if (header === "platform" || header === "location") {
                        //         $("#table td.platform:contains('" + selectedOption + "')").parent().show();
                        //         $("#table td.platform:not(:contains('" + selectedOption + "'))").parent().hide();
                        //         //getPagination('table');
                        //     }
                        //     if (header === "Тип капіталу") {
                        //         $("#table td.capital:contains('" + selectedOption + "')").parent().show();
                        //         $("#table td.capital:not(:contains('" + selectedOption + "'))").parent().hide();
                        //         //getPagination('table');
                        //     }
                        //     if (header === "Рік") {
                        //         $("#table td.year:contains('" + selectedOption + "')").parent().show();
                        //         $("#table td.year:not(:contains('" + selectedOption + "'))").parent().hide();
                        //         //getPagination('table');
                        //     }
                        // } else {
                        //     $("#table td.platform").parent().show();
                        // }
                    });



                select.selectAll("option")
                    .data(buckets)
                    .enter()
                    .append("option")
                    .text(function(d){ return d; })
                    .attr("value", function(d){ return d; })
                    .on("mouseover", function(){
                        d3.select(this).style("background-color", "white")
                    })
                    .on("mouseleave", function(){
                        d3.select(this).style("background-color", "#0D263C")
                    })

            }
        });


};

const drawT = function (targetData, multiplenest) {

    targetData.forEach(function (d) {
        d.collected_amount = +d.collected_amount;
        d.engaged_number = +d.engaged_number;
        //d.any_date = +d.any_date;
    });

    // const headers_title = [
    //     {"name": "Назва", "correspond": "title"},
    //     {"name": "К-ть голосів", "correspond": "engaged_number"},
    //     {"name": "Бюджет", "correspond": "collected_amount"},
    //     {"name": "Тип капіталу", "correspond": "capital"},
    //     {"name": multiplenest, "correspond": multiplenest},
    //     {"name": "Рік", "correspond": "any_date"}
    // ];

    // d3.select("#table_wrapper").remove();
    // d3.select("#table").remove();

    // var table = d3.select("#wrapper").append("table").attr("id", "table");
    //
    // var tableHead = table.append('thead'),
    //     tableBody = table.append('tbody');


    //table header
    //
    // const headers =  tableHead.append('tr')
    //     .selectAll('th')
    //     .data(["Назва", multiplenest, "Тип капіталу", "Бюджет", "К-ть голосів", "Рік"])
    //     .enter()
    //     .append('th')
    //     .attr("data-th", function (d) {  return d  });
    //
    // headers.append("p")
    //     .text(function (d) {
    //         return d
    //     })
    //     .on('click', function (d) {
    //         let text = d3.select(this).text();
    //         let selectedAttr = headers_title.filter(function(t){ return t.name === text});
    //         headers.attr('class', 'header');
    //         d3.selectAll("tr").attr('style', null);
    //         if (sortAscending) {
    //             rows.sort(function(a, b) {
    //                 if(selectedAttr[0].correspond === "collected_amount" ||
    //                     selectedAttr[0].correspond === "engaged_number" ||
    //                     selectedAttr[0].correspond === "any_date") {
    //                     return b[selectedAttr[0].correspond] - a[selectedAttr[0].correspond];
    //                 } else {
    //                     return d3.ascending(b[selectedAttr[0].correspond], a[selectedAttr[0].correspond]);
    //                 }
    //             });
    //             getPagination('table');
    //             sortAscending = false;
    //             this.className = 'aes';
    //         }
    //         else {
    //             rows.sort(function(a, b) {
    //                 if(selectedAttr[0].correspond === "collected_amount" ||
    //                     selectedAttr[0].correspond === "engaged_number" ||
    //                     selectedAttr[0].correspond === "any_date") {
    //                     return a[selectedAttr[0].correspond] - b[selectedAttr[0].correspond];
    //                 } else {
    //                     return d3.descending(b[selectedAttr[0].correspond], a[selectedAttr[0].correspond]);
    //                 }
    //             });
    //             getPagination('table');
    //             sortAscending = true;
    //             this.className = 'des';
    //         }
    //     });
    //
    // d3.selectAll('th') 
    //     .each(function(header) {
    //         if(header === "platform" || header === "location"|| header === "Тип капіталу" || header === "Рік") {
    //             const currentNode = this;
    //             d3.select(this)
    //                 .append("button")
    //                 .text("+")
    //                 .on("click", function(){
    //                     d3.select(currentNode).select("select").classed("hidden",  function() { return !this.classList.contains("hidden")})
    //
    //                 });
    //
    //             let selectedAttr = headers_title.filter(function(t){ return t.name === header});
    //             var buckets = [...new Set(targetData.map(function(d) { return d[selectedAttr[0].correspond]}))];
    //
    //             buckets.push("прибрати фільтр");
    //
    //             var select = d3.select(this)
    //                 .append("select")
    //                 .attr("id", selectedAttr[0].correspond)
    //                 .attr("class", "hidden")
    //                 .attr('size', 5)
    //                 .on("change", function(e){
    //                     $(this).attr("size", 1);
    //                     var selectedOption = this.options[this.selectedIndex].value;
    //
    //                     // var capitalCol =  document.getElementById("capital");
    //                     // var capitalColVal = capitalCol.options[capitalCol.selectedIndex].value;
    //                     // console.log(capitalColVal);
    //                     //
    //                     // var yearCol = document.getElementById("any_date");
    //                     // var yearColVal = yearCol.options[yearCol.selectedIndex].value;
    //                     // console.log(yearColVal);
    //                     //
    //                     // var platformCol = document.getElementById("platform");
    //                     // var platformColVal = platformCol.options[platformCol.selectedIndex].value;
    //                     // console.log(platformColVal);
    //
    //                     // if(capitalColVal && yearColVal && platformColVal){
    //                     //     console.log(capitalColVal);
    //                     //     console.log(yearColVal);
    //                     //     console.log(platformColVal);
    //                     // } else if(capitalColVal && yearColVal){
    //                     //     console.log(capitalColVal);
    //                     //     console.log(yearColVal);
    //                     // } else if(capitalColVal && platformColVal){
    //                     //     console.log(capitalColVal);
    //                     //     console.log(platformColVal);
    //                     // } else if(yearColVal && platformColVal){
    //                     //     console.log(yearColVal);
    //                     //     console.log(platformColVal);
    //                     // } else if(capitalColVal) {
    //                     //     console.log(capitalColVal);
    //                     // }  else if(yearColVal){
    //                     //     console.log(yearColVal);
    //                     // } else if(platformColVal){
    //                     //     console.log(platformColVal);
    //                     //
    //                     // }
    //
    //
    //                     if(selectedOption != "прибрати фільтр") {
    //                         if (header === "platform" || header === "location") {
    //                             $("#table td.platform:contains('" + selectedOption + "')").parent().show();
    //                             $("#table td.platform:not(:contains('" + selectedOption + "'))").parent().hide();
    //                             //getPagination('table');
    //                         }
    //                         if (header === "Тип капіталу") {
    //                             $("#table td.capital:contains('" + selectedOption + "')").parent().show();
    //                             $("#table td.capital:not(:contains('" + selectedOption + "'))").parent().hide();
    //                             //getPagination('table');
    //                         }
    //                         if (header === "Рік") {
    //                             $("#table td.year:contains('" + selectedOption + "')").parent().show();
    //                             $("#table td.year:not(:contains('" + selectedOption + "'))").parent().hide();
    //                             //getPagination('table');
    //                         }
    //                     } else {
    //                         $("#table td.platform").parent().show();
    //                     }
    //                 });
    //
    //
    //
    //             select.selectAll("option")
    //                 .data(buckets)
    //                 .enter()
    //                 .append("option")
    //                 .text(function(d){ return d; })
    //                 .attr("value", function(d){ return d; })
    //                 .on("mouseover", function(){
    //                     d3.select(this).style("background-color", "white")
    //                 })
    //                 .on("mouseleave", function(){
    //                     d3.select(this).style("background-color", "#0D263C")
    //                 })
    //
    //             }
    //         });

    // your update code here as it was in your example


    // headers.each(function(header){
    //     console.log(header);
    //     console.log(header.node);
    //     // d3.select(header).node().append("button")
    //     //     .attr("class", "plus")
    //     //     .html(function () {
    //     //         return "+"
    //     //     })
    //     //     .on("click", function(){
    //     //     });
    // });


    d3.select("tbody").remove();
    const tableBody = table.append('tbody');

    //table body
    rows = tableBody.selectAll('tr')
        .data(targetData)
        .enter()
        .append('tr');

    //додаємо іконку-вказівник сайту, лінк для переходу і курсор-поінтер тільки якщо є сайт

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


    // $('table').each(function() {
    //     var currentPage = 0;
    //     var numPerPage = 10;
    //     var $table = $(this);
    //     $table.bind('repaginate', function() {
    //         $table.find('tbody tr').hide().slice(currentPage * numPerPage, (currentPage + 1) * numPerPage).show();
    //     });
    //     $table.trigger('repaginate');
    //     var numRows = $table.find('tbody tr').length;
    //     var numPages = Math.ceil(numRows / numPerPage);
    //     var $pager = $('<div class="pager"></div>');
    //     for (var page = 0; page < numPages; page++) {
    //         $('<span class="page-number"></span>').text(page + 1).bind('click', {
    //             newPage: page
    //         }, function(event) {
    //             currentPage = event.data['newPage'];
    //             $table.trigger('repaginate');
    //             $(this).addClass('active').siblings().removeClass('active');
    //         }).appendTo($pager).addClass('clickable');
    //     }
    //     $pager.insertBefore($table).find('span.page-number:first').addClass('active');
    // });


    // rows.append('td')
    //     .attr("data-th", "Контакты")
    //     .attr("class", "flex-mobile")
    //     .append("div")
    //     .html(function (d) {
    //         return d.location
    //     });
    //
    // rows.append('td')
    //     .text(function (d) {
    //         return d.capital;
    //     });


    // //налаштування для таблиці - мова, порядок сортування, довжина, приховані колонки
    // var theTable = $('#table').DataTable({
    //     responsive: true,
    //     "pageLength": 25
    // });
    //
    //
    //
    // //select option  в другу колонку
    // $('#table thead tr th:eq(2)').each(function (d, i) {
    //     var column = this;
    //     var title = $(this).attr("data-th");
    //     console.log(title);
    //     var select = $('<select><option value="" selected></option></select>');
    //     $(this).append(select);
    //
    //     $('select', this).on('change', function () {
    //         var val = $.fn.dataTable.util.escapeRegex(
    //             $(this).val()
    //         );
    //         console.log(val);
    //
    //         theTable
    //             .column(2)
    //             .search(this.value)
    //             .draw();
    //     });
    //
    //
    //     theTable.column(2).data().unique().each(function (d, j) {
    //         select.append('<option value="' + d + '">' + d + '</option>')
    //     });
    //
    // });
    getPagination('table');

};

 //getPagination('.table-class');
 //getPagination('table');

 /*					PAGINATION
  - on change max rows select options fade out all rows gt option value mx = 5
  - append pagination list as per numbers of rows / max rows option (20row/5= 4pages )
  - each pagination li on click -> fade out all tr gt max rows * li num and (5*pagenum 2 = 10 rows)
  - fade out all tr lt max rows * li num - max rows ((5*pagenum 2 = 10) - 5)
  - fade in all tr between (maxRows*PageNum) and (maxRows*pageNum)- MaxRows
  */


 function getPagination(table) {
     var lastPage = 1;
     $('.pagination')
         .find('li')
         .slice(1, -1)
         .remove();
     var trnum = 0;
     var maxRows = 20;

     var totalRows = $(table + ' tbody tr').length; // numbers of rows
     $(table + ' tr').each(function() {
         // each TR in  table and not the header
         trnum++; // Start Counter
         if (trnum > maxRows) {
             // if tr number gt maxRows

             $(this).hide(); // fade it out
         }
         if (trnum <= maxRows) {
             $(this).show();
         } // else fade in Important in case if it ..
     }); //  was fade out to fade it in
     if (totalRows > maxRows) {
         // if tr total rows gt max rows option
         var pagenum = Math.ceil(totalRows / maxRows); // ceil total(rows/maxrows) to get ..
         //	numbers of pages
         for (var i = 1; i <= pagenum; ) {
             // for each page append pagination li
             $('.pagination #prev')
                 .before(
                     '<li data-page="' +
                     i +
                     '">\
                                       <span>' +
                     i++ +
                     '<span class="sr-only"></span></span>\
                                     </li>'
                 )
                 .show();
         } // end for i
     } // end if row count > max rows
     $('.pagination [data-page="1"]').addClass('active'); // add active class to the first li
     $('.pagination li').on('click', function(evt) {
         // on click each page
         evt.stopImmediatePropagation();
         evt.preventDefault();
         var pageNum = $(this).attr('data-page'); // get it's number

         var maxRows = 20; // get Max Rows from select option

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
         var trIndex = 0; // reset tr counter
         $('.pagination li').removeClass('active'); // remove active class from all li
         $('.pagination [data-page="' + lastPage + '"]').addClass('active'); // add active class to the clicked
         // $(this).addClass('active');					// add active class to the clicked
         limitPagging();
         $(table + ' tr:gt(0)').each(function() {
             // each tr in table not the header
             trIndex++; // tr index counter
             // if tr index gt maxRows*pageNum or lt maxRows*pageNum-maxRows fade if out
             if (
                 trIndex > maxRows * pageNum ||
                 trIndex <= maxRows * pageNum - maxRows
             ) {
                 $(this).hide();
             } else {
                 $(this).show();
             } //else fade in
         }); // end of for each tr in table
     }); // end of on click pagination list
     limitPagging();



     // end of on select change

     // END OF PAGINATION
 }

 function limitPagging(){
     // alert($('.pagination li').length)

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

















