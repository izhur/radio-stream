var acoustid = require("acoustid");

acoustid("./output/1.mp3", { key: "D59yaQNr" }, function (err, results) {
    if (err) throw err;
    //var artist = results[0].recordings[0].artists[0].name;
    console.log(results);
});