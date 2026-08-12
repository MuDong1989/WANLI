/* echarts 地图压缩坐标解码器（zigzag+delta，UTF8Scale 默认1024）——三维地图用 */
function decodeRing(str, offsets, scale){
  var out=[], px=offsets[0], py=offsets[1];
  for(var i=0;i<str.length;i+=2){
    var x=str.charCodeAt(i)-64, y=str.charCodeAt(i+1)-64;
    x=(x>>1)^(-(x&1)); y=(y>>1)^(-(y&1));
    px=x+=px; py=y+=py;
    out.push([x/scale, y/scale]);
  }
  return out;
}
function decodeGeo(json){
  if(!json.UTF8Encoding) return json;
  var scale=json.UTF8Scale||1024;
  json.features.forEach(function(f){
    var g=f.geometry, c=g.coordinates, off=g.encodeOffsets;
    if(g.type==='Polygon') c.forEach(function(r,i){ c[i]=decodeRing(r,off[i],scale); });
    else if(g.type==='MultiPolygon') c.forEach(function(poly,i){ poly.forEach(function(r,j){ poly[j]=decodeRing(r,off[i][j],scale); }); });
  });
  json.UTF8Encoding=false;
  return json;
}
if(typeof module!=='undefined') module.exports={decodeGeo:decodeGeo};
