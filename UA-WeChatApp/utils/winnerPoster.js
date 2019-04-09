export default function(obj, cb) {
  let { headimgPath, mainimgPath, qrcodePath, goodImg, nickname } = obj;
  console.log(obj);

  let ctx = wx.createCanvasContext('shareCanvas');

  //画背景
  ctx.setFillStyle('#ffffff');
  ctx.fillRect(0, 0, 375, 667);

  //画主图
  ctx.save();
  ctx.drawImage(mainimgPath, 0, 0, 375, 667);
  ctx.restore();

  //画头像
  ctx.save();
  ctx.beginPath();
  ctx.arc(189.5, 36, 29, 0, 2 * Math.PI);
  ctx.setFillStyle('#ffffff');
  ctx.fill();
  ctx.clip();
  ctx.drawImage(headimgPath, 162, 7, 58, 58);
  ctx.restore();

  ctx.setFontSize(16);
  ctx.setFillStyle('#ffffff');
  ctx.setTextAlign('center');
  ctx.fillText(nickname, 187, 98);

  //奖品图
  ctx.save();
  ctx.beginPath();
  ctx.drawImage(goodImg, 77, 111, 221, 109);
  ctx.restore();

  //二维码
  ctx.save();
  ctx.beginPath();
  ctx.arc(330, 623, 42, 0, 2 * Math.PI);
  ctx.setFillStyle('#ffffff');
  ctx.fill();
  ctx.clip();
  ctx.drawImage(qrcodePath, 290, 584, 80, 80);
  ctx.restore();

  ctx.draw(false, function() {
    cb && cb();
  });
}
