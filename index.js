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

window.addEventListener("load", async () => {
  $("#loader").show();

  client = await Ae.Aepp();
  const calledGet = await client
    .contractCallStatic(contractAddress, "sophia-address", "getMemesLength", {
      args: "()"
    })
    .catch(e => console.error(e));
  console.log("calledGet", calledGet);
  const decodedGet = await client
    .contractDecodeData(int, calledGet.result.returnValue)
    .catch(e => console.error(e));
  console.log("decodeGet", decodedGet.value);

  renderMemes();

  $("#loader").hide();
});

jQuery("#memeBody").on("click", ".voteBtn", async function(event) {
  const value = $(this)
    .siblings("input")
    .val();
  const dataIndex = event.target.id;
  const foundIndex = memeArray.findIndex(meme => meme.index == dataIndex);
  memeArray[foundIndex].votes += parseInt(value, 10);
  renderMemes();
});

$("#registerBtn").click(async function() {
  const name = $("#regName").val(),
    url = $("#regUrl").val();

  memeArray.push({
    creatorName: name,
    memeUrl: url,
    index: memeArray.length + 1,
    votes: 0
  });

  renderMemes();
});
