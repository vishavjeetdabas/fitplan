const MEALS=[
{id:'m1',time:'7:00 AM',name:'Breakfast',cal:420,p:34,c:30,f:17,foods:[['🥚','2 Whole eggs + 4 Egg whites'],['🍞','2 Slices multigrain bread'],['☕','Black coffee (no sugar)']],note:'Add veggies to omelette — onion, tomato, spinach'},
{id:'m2',time:'10:30 AM',name:'Mid-Morning',cal:370,p:31,c:38,f:9,foods:[['🥤','Whey protein shake (water)'],['🍌','1 Banana'],['🌰','8-10 Soaked almonds']]},
{id:'m3',time:'1:30 PM',name:'Lunch',cal:580,p:34,c:62,f:24,foods:[['🫓','2 Multigrain roti'],['🥘','1 Bowl sabzi (home-cooked)'],['🧀','100g Paneer bhurji'],['🥣','1 Bowl curd/raita']],note:'Chicken days: replace paneer with 150g grilled chicken'},
{id:'m4',time:'4:30 PM',name:'Evening Snack',cal:200,p:5,c:25,f:8,foods:[['🍎','1 Fruit (apple/orange/guava)'],['🥜','1 tbsp Peanut butter'],['🍵','Green tea']]},
{id:'m5',time:'6:15 PM',name:'Pre-Workout',cal:130,p:1,c:30,f:0,foods:[['🍌','1 Banana'],['☕','Black coffee (no sugar)']],note:'Take 5g creatine post-workout instead'},
{id:'m6',time:'8:45 PM',name:'Post-WO + Dinner',cal:750,p:65,c:85,f:17,foods:[['🥤','Whey shake + 5g Creatine'],['🫓','2 Multigrain roti'],['🥘','1 Bowl sabzi'],['🥚','4 Egg whites + 1 Whole egg'],['🥛','Toned milk (250ml)']]}
];
const SUPPS=[
{i:'🥤',bg:'var(--grnd)',n:'Whey Protein',d:'10:30 AM + 8:30 PM · Cold water'},
{i:'⚡',bg:'var(--blud)',n:'Creatine (5g)',d:'8:30 PM post-workout · With shake'},
{i:'💊',bg:'var(--orgd)',n:'Multivitamin',d:'7 AM with breakfast'},
{i:'🐟',bg:'var(--purd)',n:'Fish Oil',d:'1:30 PM with lunch'}
];
const RULES=['No junk/cold drinks/sweets weekdays. One cheat meal Sunday.','Drink 4L water daily.','Coffee: 2 cups/day max (black, no sugar).','Curd/Lassi is GOOD — probiotics.','Milk before bed — casein feeds muscles.','Eat dinner EVERY night.'];
const WARMUP=[['Jump rope / Light jog','3 min'],['Arm circles','15 each'],['Band pull-aparts','15 reps'],['Cat-cow stretch','10 reps'],['Hip circles','10 each'],['Bodyweight squats','15 reps'],['Dead hang','30 sec']];
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const WK={
0:{t:'PUSH A',n:'Chest Focus',f:'Heavy Compounds',ex:[{n:'Flat Barbell Bench Press',s:'4×8-10',r:'2-3 min'},{n:'Incline DB Press (30°)',s:'3×10-12',r:'90s'},{n:'Cable Chest Fly',s:'3×12-15',r:'60s'},{n:'Overhead DB Press (seated)',s:'3×10-12',r:'90s'},{n:'Lateral Raises (DB)',s:'4×15-20',r:'45s'},{n:'Tricep Rope Pushdown',s:'3×12-15',r:'60s'},{n:'Overhead Tricep Extension',s:'3×12-15',r:'60s'},{n:'Face Pulls ⭐',s:'3×15-20',r:'45s',star:1,nt:'Mandatory — fixes rounded shoulders'}]},
1:{t:'PULL A',n:'Back Heavy',f:'Heavy Compounds',ex:[{n:'Deadlift (conventional)',s:'4×6-8',r:'3 min',nt:'Start light. Build slowly.'},{n:'Barbell Bent-Over Row',s:'4×8-10',r:'2 min'},{n:'Lat Pulldown (wide)',s:'3×10-12',r:'90s'},{n:'Seated Cable Row',s:'3×10-12',r:'90s'},{n:'DB Bicep Curl',s:'3×10-12',r:'60s'},{n:'Hammer Curl',s:'3×10-12',r:'60s'},{n:'Face Pulls ⭐',s:'3×15-20',r:'45s',star:1},{n:'Rear Delt Fly ⭐',s:'3×15-20',r:'45s',star:1}]},
2:{t:'LEGS A',n:'Quad Focus',f:'+ Posture Correction',ex:[{n:'Barbell Back Squat',s:'4×8-10',r:'2-3 min'},{n:'Leg Press',s:'3×10-12',r:'2 min'},{n:'Walking Lunges (DB)',s:'3×12 each',r:'90s'},{n:'Leg Extension',s:'3×12-15',r:'60s'},{n:'Leg Curl',s:'3×12-15',r:'60s'},{n:'Standing Calf Raise',s:'4×15-20',r:'45s'},{n:'Hanging Leg Raise',s:'3×12-15',r:'60s'}],pos:[{n:'Chin Tucks (wall)',s:'3×15',w:'Fixes forward head'},{n:'Wall Angels',s:'3×12',w:'Fixes rounded shoulders'},{n:'Glute Bridge (3s hold)',s:'3×15',w:'Fixes anterior pelvic tilt'},{n:'Dead Bug',s:'3×10 each',w:'Core + APT'},{n:'Hip Flexor Stretch',s:'2×30s each',w:'Releases tight hip flexors'}]},
3:{t:'PUSH B',n:'Shoulder Focus',f:'Volume + Aesthetics',ex:[{n:'Overhead Barbell Press',s:'4×8-10',r:'2-3 min'},{n:'Incline Barbell Bench',s:'3×10-12',r:'2 min'},{n:'DB Chest Fly (flat)',s:'3×12-15',r:'60s'},{n:'Lateral Raises (cable)',s:'4×12-15',r:'45s'},{n:'Front Raise (DB)',s:'3×12',r:'45s'},{n:'Close-Grip Bench',s:'3×10-12',r:'90s'},{n:'Skull Crushers',s:'3×10-12',r:'60s'},{n:'Face Pulls ⭐',s:'3×15-20',r:'45s',star:1}]},
4:{t:'PULL B',n:'Back Width + Arms',f:'Volume + Aesthetics',ex:[{n:'Weighted Pull-Ups',s:'4×6-10',r:'2-3 min'},{n:'T-Bar Row',s:'4×10-12',r:'90s'},{n:'Single-Arm DB Row',s:'3×10-12 each',r:'60s'},{n:'Cable Pullover',s:'3×12-15',r:'60s'},{n:'Incline DB Curl',s:'3×10-12',r:'60s'},{n:'Cable Curl (EZ)',s:'3×12-15',r:'60s'},{n:'Face Pulls ⭐',s:'3×15-20',r:'45s',star:1},{n:'Rear Delt Fly ⭐',s:'3×15-20',r:'45s',star:1}]},
5:{t:'LEGS B',n:'Ham/Glute Focus',f:'+ Swimming',ex:[{n:'Romanian Deadlift',s:'4×8-10',r:'2-3 min'},{n:'Bulgarian Split Squat',s:'3×10-12 each',r:'90s'},{n:'Hack/Goblet Squat',s:'3×10-12',r:'90s'},{n:'Seated Leg Curl',s:'3×12-15',r:'60s'},{n:'Hip Thrust (barbell)',s:'3×10-12',r:'90s'},{n:'Seated Calf Raise',s:'4×15-20',r:'45s'},{n:'Cable Crunch (abs)',s:'3×15-20',r:'60s'},{n:'Plank Hold',s:'3×45-60s',r:'45s'}],xn:'🏊 After gym → Swimming (30-45 min)'},
6:{t:'REST',n:'Recovery Day',f:'Active Rest',rest:1,ra:['🏊 Optional: Swimming (30-45 min)','🚶 OR 30 min walk','🧘 Foam rolling / stretching','🏋️ Posture circuit from Wednesday']}
};
const CK=[
{id:'c1',e:'💧',t:'Drank 4L water'},{id:'c2',e:'🍽️',t:'All 6 meals eaten'},{id:'c3',e:'🥩',t:'170g protein hit'},
{id:'c4',e:'🏋️',t:'Gym done full intensity'},{id:'c5',e:'🎯',t:'Face pulls done'},{id:'c6',e:'🧍',t:'Posture exercises'},
{id:'c7',e:'😴',t:'7-8 hours sleep'},{id:'c8',e:'✨',t:'Skincare AM + PM'},{id:'c9',e:'🚫',t:'No junk food'}
];
const LM=[['💆','Face Bloat','Low sodium + 4L water + sleep'],['✨','Skin Glow','1 orange/amla daily + fish oil'],['🗿','Jawline','Fat loss + chew gum 10 min/day'],['👁️','Dark Circles','7-8 hrs sleep + blue light glasses'],['⚡','Energy','Banana + creatine + no sugar crashes'],['🧍','Posture','Fix forward head + rounded shoulders']];
const GR=[['🥚','Eggs (2.5 trays)'],['🍞','Multigrain bread'],['🍌','Bananas (7-8)'],['🍎','Fruits (7)'],['🌰','Almonds'],['🥜','Peanut butter'],['🧀','Paneer (400-500g)'],['🍗','Chicken (2-3x)'],['🥛','Milk (2L)'],['🥣','Curd (1kg)'],['🥤','Whey protein'],['⚡','Creatine']];
