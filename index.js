const contractAddress = "ct_2smCzyRixwFWcRgQguaa9TezXy3Wfcv4yZ4sggLbux832uCFe2";
var client = null;

var memeArray = [];
var memesLength = 0;

function renderMemes() {
  memeArray = memeArray.sort(function(a, b) {
    return b.votes - a.votes;
  });
  var template = $("#template").html();
  Mustache.parse(template);
  var rendered = Mustache.render(template, { memeArray });
  $("#memeBody").html(rendered);
}

async function callStatic(func, args, types) {
  const calledGet = await client
    .contractCallStatic(contractAddress, "sophia-address", func, { args })
    .then(response => {
      console.log(response);
    })
    .catch(console.error());

  const decodedGet = await client.contractDecodeData(
    types,
    calledGet.result.returnValue
  );
  then(response => {
    console.log(response);
  }).catch(console.error());

  return decodedGet;
}

async function contractCall(func, args, value, types) {
  const calledSet = await client
    .contractCall(contractAddress, "sophia-address", contractAddress, func, {
      args,
      options: { amount: value }
    })
    .catch(async e => {
      const decodedError = await client
        .contractDecodeData(types, e.returnValue)
        .then(response => {
          console.log(response);
        })
        .catch(e => console.error(e));
    });

  return calledSet;
}

window.addEventListener("load", async () => {
  

  client = await Ae.Aepp();

  const getMemesLength = await callStatic("getMemesLength", "()", "int");
  memesLength = getMemesLength.value;

  for (let i = 1; i <= memesLength; i++) {
    const meme = await callStatic(
      "getMeme",
      `(${i})`,
      "(address, string, string, int)"
    );

    memeArray.push({
      creatorName: meme.value[2].value,
      memeUrl: meme.value[1].value,
      index: i,
      votes: meme.value[3].value
    });
  }

  renderMemes();

  $("#loader").hide();
});

jQuery("#memeBody").on("click", ".voteBtn", async function(event) {
  $("#loader").show();

  const value = $(this)
    .siblings("input")
    .val();
  const dataIndex = event.target.id;

  await contractCall("voteMeme", `(${dataIndex})`, value, "(int)");

  const foundIndex = memeArray.findIndex(meme => meme.index == dataIndex);
  memeArray[foundIndex].votes += parseInt(value, 10);

  renderMemes();

  $("#loader").hide();
});

$("#registerBtn").click(async function() {
  $("#loader").show();

  const name = $("#regName").val(),
    url = $("#regUrl").val();

  await contractCall("registerMeme", `("${url}","${name}")`, 0, "(int)");

  memeArray.push({
    creatorName: name,
    memeUrl: url,
    index: memeArray.length + 1,
    votes: 0
  });

  renderMemes();

  $("#loader").hide();
});
