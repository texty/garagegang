
var sortAscending = true;
var table = d3.select("#table");
var rows;


const drawTable = function (targetData, value_type, odd_fill) {

    d3.select("tbody").remove();
    d3.select("thead").remove();
    
    var amount = value_type === "engaged_number"? "К-ть голосів" : "Бюджет, грн";    

    const tableHead = table.append('thead'),
          tableBody = table.append('tbody');


    tableHead.append('tr').selectAll('th')
        .data(["Назва проекту", amount, "Рік"]).enter()
        .append('th')
        .attr("data-th",function (d) {
                return d
        })
        .text(function (d) { return d; });

    rows = tableBody.selectAll('tr')
        .data(targetData).enter()
        .append('tr');

    rows.append("td")
        .attr("data-th", "Назва")
        .text(function (d) { return d.title.replace('^"', ''); });

    rows.append('td')
        .attr("data-th", amount)
        .text(function (d) { return formatValue(d[value_type]);  });

    rows.append('td')
        .attr("data-th", "Рік")
        .attr("class", "year")
        .text(function (d) { return d.any_date; });

    $("tbody > tr:nth-child(odd)").css("background-color", odd_fill);

    getPagination('table');
};


 function getPagination(table) {
     var lastPage = 1;
     $('.pagination')
         .find('li')
         // .slice(1, -1)
         .remove();

     var trnum = 0;
     var maxRows = 25;

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








