const chooseMarkdown = markdownId  => {
  const markdownName = document.getElementById(markdownId).innerText;

  document.getElementById("markdownType").value = markdownName;
  document.getElementById("mrkdwn_type").innerText = markdownName;
};