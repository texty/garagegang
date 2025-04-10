var sortBudget = false;
var sortVoices = false;
var table = d3.select("#table");
var rows;

const drawTable = function (targetData, value_type, odd_fill) {
  table.select("tbody").remove();
  const tableBody = table.append("tbody");

  rows = tableBody.selectAll("tr").data(targetData).enter().append("tr");

  rows
    .append("td")
    .attr("data-th", "Назва")
    .html(function (d) {
      return (
        "<a class='project-id' href='" +
        d.id +
        "' target='_blank' >" +
        d.title.replace('^"', "")
      );
      +"</a>";
    });

  rows
    .append("td")
    .attr("data-th", "Бюджет, грн")
    .text(function (d) {
      return formatValue(d.collected_amount);
    });

  rows
    .append("td")
    .attr("data-th", "К-ть голосів")
    .text(function (d) {
      return formatValue(d.engaged_number);
    });

  rows
    .append("td")
    .attr("data-th", "Рік")
    .attr("class", "year")
    .text(function (d) {
      return d.year;
    });

  $("#table tbody > tr:nth-child(odd)").css("background-color", odd_fill);

  getPagination("#table");
};

$("thead > tr > th:nth-child(2)").on("click", function () {
  console.log(this);
  $(this).toggleClass("headerSortUp").toggleClass("headerSortDown");
  $("tbody tr").attr("style", null);
  console.log(sortBudget);
  if (sortBudget === true) {
    rows.sort(function (a, b) {
      return +b.collected_amount - +a.collected_amount;
    });
  } else {
    rows.sort(function (a, b) {
      return +a.collected_amount - +b.collected_amount;
    });
  }
  sortBudget = !sortBudget;
  $("tbody > tr:nth-child(odd)").css("background-color", odd_fill);
  getPagination("#table");
});

$("thead > tr > th:nth-child(3)").on("click", function () {
  $(this).toggleClass("headerSortUp").toggleClass("headerSortDown");
  $("tbody tr").attr("style", null);
  console.log(sortVoices);
  if (sortVoices === true) {
    rows.sort(function (a, b) {
      return +b.engaged_number - +a.engaged_number;
    });
  } else {
    rows.sort(function (a, b) {
      return +a.engaged_number - +b.engaged_number;
    });
  }
  sortVoices = !sortVoices;
  $("tbody > tr:nth-child(odd)").css("background-color", odd_fill);
  getPagination("#table");
});

function getPagination(table) {
  var lastPage = 1;
  $(".pagination").find("li").remove();

  var trnum = 0;
  var maxRows = 15;

  var totalRows = $(table + " > tbody > tr").length; // numbers of rows
  $(table + " > tbody > tr").each(function () {
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
      $(".pagination")
        .append(
          '<li data-page="' +
            i +
            '"> <span>' +
            i++ +
            '<span class="sr-only"></span></span></li>'
        )
        .show();
    }
  }
  $('.pagination [data-page="1"]').addClass("active");
  $(".pagination li").on("click", function (evt) {
    evt.stopImmediatePropagation();
    evt.preventDefault();
    var pageNum = $(this).attr("data-page");

    if (pageNum == "prev") {
      if (lastPage == 1) {
        return;
      }
      pageNum = --lastPage;
    }
    if (pageNum == "next") {
      if (lastPage == $(".pagination li").length - 2) {
        return;
      }
      pageNum = ++lastPage;
    }

    lastPage = pageNum;
    var trIndex = 0; //
    $(".pagination li").removeClass("active");
    $('.pagination [data-page="' + lastPage + '"]').addClass("active");
    limitPagging();
    $(table + " > tbody > tr").each(function () {
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

function limitPagging() {
  if ($(".pagination li").length > 7) {
    if ($(".pagination li.active").attr("data-page") <= 3) {
      $(".pagination li:gt(5)").hide();
      $(".pagination li:lt(5)").show();
      $('.pagination [data-page="next"]').show();
    }
    if ($(".pagination li.active").attr("data-page") > 3) {
      $(".pagination li:gt(0)").hide();
      $('.pagination [data-page="next"]').show();
      for (
        var i = parseInt($(".pagination li.active").attr("data-page")) - 2;
        i <= parseInt($(".pagination li.active").attr("data-page")) + 2;
        i++
      ) {
        $('.pagination [data-page="' + i + '"]').show();
      }
    }
  }
}
