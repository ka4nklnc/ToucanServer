var x = [];

function add() {
  for (var i = 0; i < 12; i++) {
    var m = {
      number: i,
    };

    x.push(m);
  }
}

setInterval(function() {
  console.log("-");
  x.forEach((v, i) => {
    console.log(v.number);
  });

  x.splice(5, 1);
}, 2000);

add();
