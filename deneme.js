var _resenddata = [];

push = (userId, data, save) => {
  var model = _resenddata.filter((v, i) => {
    console.log(v.userId, userId);
    if (v.userId == userId) return v;
  });
  console.log(model);
  if (model.length == 0) {
    model = {
      userId,
      _resendList: [],
      reSend: setTimeout(() => {
        for (var i = 0; i < model._resendList.length; i++) {
          var m = model._resendList[i]
          console.log(model.userId,m) 
        }

        console.log(model._resendList.length);
      }, 3000),
    };

    _resenddata.push(model);
  } else model = model[0];
  var obje = {
    data: data,
    save,
  };

  model._resendList.push(obje);

  //console.log(model)
};

for (var i = 0; i < 10; i++) {
  for (var j = 0; j < 10; j++){ push(i, "deneme" + j, true);}
}
