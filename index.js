var icy = require('icy');
var lame = require('lame');
var Speaker = require('speaker');
var fs = require('fs');
//var fpcalc = require("fpcalc");
var acoustid = require("acoustid");

//var output = require('./output');

// URL to a known ICY stream
//var url = 'http://stream.suararadio.com:8000/bandung_klitefm_mp3';
//var url = 'http://stream.masima.co.id:8000/delta';
//var url = 'http://stream.masima.co.id:8000/prambors';
//var url = 'http://stream.masima.co.id:8000/female';
// var url = 'http://stream.suararadio.com:8000/radio2020_mp3';
var url = 'http://stream.suararadio.com:8000/bass';

var decoder = lame.Decoder();
var outstream = null;
var idxfile = 0;
var countByte = 0;
var parsedmeta = {};
var streammeta = {};
var fname = '';
var interval = null;
var timer = 0;
var start = Math.round(new Date().getTime()/1000);
var regex = /.* \[(\d+)\]$/

console.log(start);

function createStream() {
	idxfile = Math.floor((idxfile+1)%10);
	if (parsedmeta['content-type']=='audio/mpeg') {
		fname = idxfile+'.mp3';
	} else {
		fname= idxfile+'.wav';
	}
	outstream = fs.createWriteStream('./output/'+fname, { flags: 'w' });
	countByte = 0;
	console.log('',idxfile,fname);
}

function closeStream() {
	outstream.close();
	outstream = null;
	/*fpcalc("./output/"+fname, function(err, result) {
    	if (err) throw err;
    	console.log(result.file, result.duration, result.fingerprint);
	});*/
	acoustid("./output/"+fname, { key: "D59yaQNr" }, function (err, results) {
	    //if (err) throw err;
	    //var artist = results[0].recordings[0].artists[0].name;
	    console.log(results);
	});
}

function writeOutput(buffer) {
	if (!outstream) {
		createStream();
	}
	countByte = countByte+buffer.length;
	outstream.write(buffer);
	decoder.write(buffer);
	if (countByte>100000) {
		closeStream();
	}
}

function caclTime(intime) {
  var end = Math.round(new Date().getTime()/1000);
  var elapsed = end - start;
  start = end;
  console.log('elapsed',elapsed, end);
  return timer + elapsed;
}

// connect to the remote stream
icy.get(url, function (res) {

  // log the HTTP response headers
  console.error(res.headers);
  parsedmeta = res.headers;

  // log any "metadata" events that happen
  res.on('metadata', function (metadata) {
    streammeta = icy.parse(metadata);
    console.log(streammeta);
    // var tmp = 0;
    // var tmp2 = 0;
    var result = streammeta.StreamTitle.match(regex);
    console.log(result);
    if (result) {
      var intime = parseInt(result[1]);
      var timerElapsed = caclTime(intime);
      
      console.log(timerElapsed, intime, intime-timerElapsed);
      timer = intime;
    }
    
    // tmp = (1000*60*60);
    // var hour = intime % tmp;
    // tmp2 = (60*1000);
    // var minute = intime-tmp % tmp2;
    // var sec = intime-(tmp+tmp2) % 1000;
    // var mili = intime-(tmp+tmp2)-1000;
    // clearInterval(interval);
  });

  // Let's play the music (assuming MP3 data).
  // lame decodes and Speaker sends to speakers!
  res.pipe(new lame.Decoder())
     .pipe(new Speaker());
  //res.on('data', function(buffer) {
    //process.stdout.write(buffer);
  //  writeOutput(buffer); 
  //});
  //res.pipe(decoder);
});

decoder.pipe(new Speaker());
/*
decoder.on('data', function(buffer) {
	process.stdout.write(buffer);
});*/
