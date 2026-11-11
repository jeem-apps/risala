// Daily Telegram reminder for the thesis tracker. Runs on GitHub Actions.
// Usage: node scripts/reminder.mjs morning|evening   (needs TELEGRAM_TOKEN, TELEGRAM_CHAT_ID)
const MODE = process.argv[2] || "morning";
const APP = "https://jeem-apps.github.io/risala/";
const START = "2026-11-11", DEADLINE = "2027-07-23";
const PARTS = ["الفصل الأول","الفصل الثاني","الفصل الثالث","الفصل الرابع","الفصل الخامس","خاتمة الباب الثاني","الفصل السادس","الفصل السابع","الفصل الثامن","الفصل التاسع","المقدمة","الخاتمة","المصادر والمراجع","المراجعة النهائية"];
const HOLIDAYS = {"2026-11-13":"شهادة السيدة فاطمة الزهراء (ع)","2026-12-23":"ولادة الإمام علي (ع)","2027-01-06":"المبعث النبوي الشريف","2027-01-24":"النصف من شعبان","2027-02-11":"ذكرى انتصار الثورة الإسلامية","2027-02-28":"شهادة الإمام علي (ع)","2027-03-10":"عيد الفطر","2027-03-11":"عطلة عيد الفطر","2027-03-20":"يوم تأميم النفط","2027-03-21":"عيد النوروز","2027-03-22":"عيد النوروز","2027-03-23":"عيد النوروز","2027-03-24":"عيد النوروز","2027-04-01":"يوم الجمهورية الإسلامية","2027-04-02":"يوم الطبيعة","2027-04-03":"شهادة الإمام الصادق (ع) (تقديري)","2027-05-16":"عيد الأضحى (تقديري)","2027-05-24":"عيد الغدير (تقديري)","2027-06-04":"ذكرى رحيل الإمام الخميني","2027-06-05":"ذكرى ١٥ خرداد","2027-06-14":"تاسوعاء (تقديري)","2027-06-15":"عاشوراء (تقديري)"};
const HSTARTS=[["2026-10-12",1448,5],["2026-11-11",1448,6],["2026-12-11",1448,7],["2027-01-10",1448,8],["2027-02-08",1448,9],["2027-03-10",1448,10],["2027-04-08",1448,11],["2027-05-07",1448,12],["2027-06-06",1449,1],["2027-07-05",1449,2],["2027-08-03",1449,3]];
const HM=["محرّم","صفر","ربيع الأول","ربيع الثاني","جمادى الأولى","جمادى الآخرة","رجب","شعبان","شهر رمضان","شوّال","ذو القعدة","ذو الحجّة"];
const PM=["فروردين","أرديبهشت","خرداد","تير","مرداد","شهريور","مهر","آبان","آذر","دي","بهمن","إسفند"];
const WD=["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
const ar=v=>String(v).replace(/[0-9]/g,d=>"٠١٢٣٤٥٦٧٨٩"[d]).replace(/\./g,"٫");
const D=iso=>new Date(iso+"T12:00:00Z");
const diff=(a,b)=>Math.round((D(b)-D(a))/864e5);
const add=(iso,n)=>{const d=D(iso);d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)};
const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Tehran",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
function hijri(iso){let e=null;for(const x of HSTARTS)if(x[0]<=iso)e=x;
  if(e&&iso<HSTARTS[HSTARTS.length-1][0])return `${ar(diff(e[0],iso)+1)} ${HM[e[2]-1]} ${ar(e[1])}هـ`;
  const p={};for(const x of new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn",{timeZone:"UTC",year:"numeric",month:"numeric",day:"numeric"}).formatToParts(D(iso)))p[x.type]=x.value;
  return `${ar(+p.day)} ${HM[+p.month-1]} ${ar(parseInt(p.year))}هـ`}
function persian(iso){const p={};for(const x of new Intl.DateTimeFormat("en-u-ca-persian-nu-latn",{timeZone:"UTC",year:"numeric",month:"numeric",day:"numeric"}).formatToParts(D(iso)))p[x.type]=x.value;
  return `${ar(+p.day)} ${PM[+p.month-1]} ${ar(parseInt(p.year))}هـ.ش`}
const isFri=iso=>D(iso).getUTCDay()===5;
const left=diff(today,DEADLINE);
let work=0;for(let d=today;d<DEADLINE;d=add(d,1))if(!isFri(d)&&!HOLIDAYS[d])work++;
const per=diff(START,DEADLINE)/PARTS.length;
const idx=Math.min(PARTS.length-1,Math.max(0,Math.floor(diff(START,today)/per)));
const due=add(START,Math.round(per*(idx+1)));
const dueLeft=diff(today,due);
const dateLine=`${WD[D(today).getUTCDay()]} ${hijri(today)} — ${persian(today)}`;
const hol=HOLIDAYS[today]?`\n🔴 اليوم عطلة رسمية: ${HOLIDAYS[today]}`:(isFri(today)?"\n🔴 اليوم جمعة":"");
let text;
if(left<0) process.exit(0);
if(MODE==="morning"){
  text=`☀️ صباح الخير\n${dateLine}${hol}\n\n⏳ باقٍ ${ar(left)} يومًا على التسليم (منها ${ar(work)} يوم عمل).\n📌 بحسب الجدول: ${PARTS[idx]} — موعده المقترح ${hijri(due)} (${dueLeft>=0?"بعد "+ar(dueLeft)+" يومًا":"فات"}).\n\nافتح التطبيق وحدّد مبحث اليوم:\n${APP}`;
}else{
  text=`🌙 حان وقت تحديث إنجازات اليوم ✍️\n${dateLine}\n\nسجّل ما أنجزته وعدد الساعات، وحدّث حالة المبحث إن تقدّمت فيه.\n⏳ باقٍ ${ar(left)} يومًا على التسليم.\n\n${APP}`;
}
const {TELEGRAM_TOKEN:tok,TELEGRAM_CHAT_ID:chat}=process.env;
if(!tok||!chat){console.log(text);console.log("\n(no TELEGRAM_TOKEN / TELEGRAM_CHAT_ID set — message printed only)");process.exit(0)}
const r=await fetch(`https://api.telegram.org/bot${tok}/sendMessage`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chat_id:chat,text,disable_web_page_preview:true})});
const j=await r.json();if(!j.ok){console.error(j);process.exit(1)}console.log("sent");
