import https from "https";

https.get(`https://en.wikipedia.org/w/api.php?action=query&titles=Mishary_Rashid_Alafasy&prop=pageimages&format=json&pithumbsize=400`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
