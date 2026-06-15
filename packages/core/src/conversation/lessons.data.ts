/**
 * The course lesson data — the canonical source, hand-editable.
 * Bootstrapped by scripts/build-lessons.mjs (one-time authoring pipeline); edit lessons
 * directly here now. Keep existing lesson ids stable so saved progress never breaks.
 */
import type { Lesson } from './curriculum.js';

export const LESSONS: Lesson[] = [
  {
    "id": "f1-greet",
    "unitId": "f1",
    "levelId": "foundation",
    "title": "Greetings & hellos",
    "fn": "Greet people and respond",
    "canDo": "I can greet people and respond naturally at any time of day.",
    "phrases": [
      "Hi, how are you?",
      "Good morning / afternoon / evening",
      "I'm good, thanks — and you?",
      "Nice to meet you",
      "Long time no see!"
    ],
    "scenario": "Warmly greet the learner as if you've just run into them. Get them to greet you back and answer 'how are you?'. Vary the time of day.",
    "variants": [
      "You're both arriving at a wedding or family function in the morning; greet the learner warmly, ask how they are, and keep it light.",
      "You bump into the learner in the evening after months apart; use 'Long time no see!' and get them to greet you back and ask how you've been."
    ],
    "l1Note": "Answer 'How are you?' briefly ('Good, thanks') and ask back — a long answer feels unnatural."
  },
  {
    "id": "f1-introduce",
    "unitId": "f1",
    "levelId": "foundation",
    "title": "Introduce yourself",
    "fn": "Say your name, origin and work",
    "canDo": "I can introduce myself — my name, where I'm from, and what I do.",
    "phrases": [
      "I'm… / My name is…",
      "I'm from…",
      "I work as a… / I'm a…",
      "I live in…",
      "What about you?"
    ],
    "scenario": "Play a friendly new neighbour. Introduce yourself, then get the learner to share their name, where they are from, and what they do.",
    "variants": [
      "Play someone the learner just sat next to on a long train journey; start chatting and get them to introduce themselves and ask about you.",
      "Play a host on day one of a class or workshop; go round the room and get the learner to say their name, where they're from, and what they do."
    ],
    "l1Note": "Say 'I am a teacher' — don't drop the 'a' before a job."
  },
  {
    "id": "f1-goodbye",
    "unitId": "f1",
    "levelId": "foundation",
    "title": "Goodbyes",
    "fn": "End a conversation politely",
    "canDo": "I can end a conversation politely.",
    "phrases": [
      "It was nice talking to you",
      "See you later / soon",
      "Take care",
      "Have a good day",
      "Catch you later"
    ],
    "scenario": "After a short, friendly chat, start winding down and get the learner to say a natural goodbye.",
    "variants": [
      "You've been chatting at a tea stall and the learner's auto has arrived; wind down quickly and get them to say a warm, natural goodbye.",
      "It's the end of a long video call; signal you're wrapping up and have the learner close the conversation politely before hanging up."
    ]
  },
  {
    "id": "f1-introduce-others",
    "unitId": "f1",
    "levelId": "foundation",
    "title": "Introducing others",
    "fn": "Introduce one person to another",
    "canDo": "I can introduce two people to each other and help them connect.",
    "phrases": [
      "This is my friend…",
      "Have you two met?",
      "Raj, meet Priya",
      "She works with me at…",
      "I think you two will get along",
      "I'll let you two chat"
    ],
    "scenario": "Play a person the learner knows well. Set up a casual meet-up where a third person (you can voice them too) walks over, and get the learner to introduce the two of you, adding a line of context about each so you connect.",
    "variants": [
      "Play a colleague at an office party; the learner introduces you to their manager and adds a line about who each of you is.",
      "Play the learner's cousin at a family function; have the learner introduce you to a neighbour and explain how you each know them."
    ],
    "l1Note": "Say 'This is my friend Raj' — don't say 'He is my friend named Raj'; the natural form is short."
  },
  {
    "id": "f2-routine",
    "unitId": "f2",
    "levelId": "foundation",
    "title": "Your daily routine",
    "fn": "Describe your day",
    "canDo": "I can describe my daily routine.",
    "phrases": [
      "I usually wake up at…",
      "Then I…",
      "In the evening, I…",
      "On weekends, I…",
      "Most days I…"
    ],
    "scenario": "Ask about their typical day and keep them describing their routine, step by step, in the present tense.",
    "variants": [
      "Play a curious colleague over a tea break; ask how their workday is usually structured, from arriving to clocking off.",
      "Play a friend who has just started a new job; ask how their daily routine has changed and walk through a typical new day, step by step."
    ]
  },
  {
    "id": "f2-likes",
    "unitId": "f2",
    "levelId": "foundation",
    "title": "Likes & dislikes",
    "fn": "Talk about what you like",
    "canDo": "I can talk about what I like and don't like.",
    "phrases": [
      "I love… / I really like…",
      "I'm into…",
      "I don't really like…",
      "I can't stand…",
      "I prefer … to …"
    ],
    "scenario": "Chat about food, films, music and hobbies; get them to express clear likes and dislikes.",
    "variants": [
      "You're both picking a place to eat this weekend; get them to say which cuisines they love, what they can't stand, and what they'd prefer.",
      "Play someone setting up a movie night; ask about their taste in shows, films and music and pull out clear likes, dislikes and preferences."
    ]
  },
  {
    "id": "f2-family",
    "unitId": "f2",
    "levelId": "foundation",
    "title": "Family & home",
    "fn": "Describe family and home",
    "canDo": "I can describe my family and where I live.",
    "phrases": [
      "I have a … (brother/sister)",
      "We live in…",
      "My … is a …",
      "There are … of us",
      "I live with…"
    ],
    "scenario": "Ask about their family and home and keep them describing the people and the place.",
    "variants": [
      "Play a new flatmate getting to know them; ask who's in their family back home and what their hometown is like.",
      "You're looking at an old family photo together; get them to point out each person, describe them, and say who they live with now."
    ]
  },
  {
    "id": "f2-weather-feelings",
    "unitId": "f2",
    "levelId": "foundation",
    "title": "Weather & how you feel",
    "fn": "Talk about the weather and how you're doing",
    "canDo": "I can chat about the weather and say how I'm feeling.",
    "phrases": [
      "It's so hot today!",
      "It's really humid",
      "I'm feeling a bit tired",
      "I've got a slight headache",
      "I feel much better now",
      "Lovely weather, isn't it?",
      "I'm not feeling great today"
    ],
    "scenario": "Play a neighbour bumping into the learner on a hot or rainy day; comment on the weather, ask how they're doing, and get them to describe both the weather and how they feel.",
    "variants": [
      "Play a friend who calls during the first monsoon rain; chat about the sudden downpour and ask how they're holding up.",
      "Play a co-worker who notices the learner looks worn out; gently ask how they're feeling and let them describe being unwell, then a bit better."
    ],
    "l1Note": "Say 'It's raining' or 'It's hot', not 'It is having rain' — use 'It's' plus the weather word."
  },
  {
    "id": "f3-order",
    "unitId": "f3",
    "levelId": "foundation",
    "title": "Ordering food",
    "fn": "Order at a café or restaurant",
    "canDo": "I can order food and drinks politely.",
    "phrases": [
      "Can I have…, please?",
      "I'll take the…",
      "Could I get…",
      "Anything to drink? — Yes, a…",
      "That's all, thanks"
    ],
    "scenario": "Play a friendly waiter. Take their order, ask follow-ups (size, drink, anything else), then total it up.",
    "variants": [
      "Play a street-food vendor at a busy stall (chaat, dosa or momos). Take their order, ask the spice level and whether to pack it or eat there, then tell them the amount.",
      "Play a barista at a coffee chain. The learner orders a customised drink (size, hot or cold, less sugar) and decides between dine-in and takeaway."
    ]
  },
  {
    "id": "f3-shop",
    "unitId": "f3",
    "levelId": "foundation",
    "title": "Shopping & prices",
    "fn": "Shop and ask about prices",
    "canDo": "I can shop and ask about prices and sizes.",
    "phrases": [
      "How much is this?",
      "Do you have this in…?",
      "Can I try it on?",
      "I'm just looking, thanks",
      "I'll take it"
    ],
    "scenario": "Play a shop assistant; help them buy something and handle price, size and colour questions.",
    "variants": [
      "Play a vegetable vendor at a weekly market. The learner buys a few things by weight, asks the rate, and bargains a little before paying.",
      "Play a salesperson at an electronics shop. Help them compare two phone models, ask about warranty and price, then decide."
    ]
  },
  {
    "id": "f3-directions",
    "unitId": "f3",
    "levelId": "foundation",
    "title": "Asking directions",
    "fn": "Ask for and follow directions",
    "canDo": "I can ask for and follow simple directions.",
    "phrases": [
      "Excuse me, how do I get to…?",
      "Is it far?",
      "Go straight / turn left / turn right",
      "It's next to / opposite…",
      "Thanks, I'll find it"
    ],
    "scenario": "They are lost. Play a helpful local; have them ask the way to a landmark, then you give simple directions.",
    "variants": [
      "The learner is inside a big mall looking for a particular shop, the washroom and the food court. Play a security guard giving floor-by-floor directions.",
      "Play a petrol pump attendant on a highway. The learner asks how to reach the next town, how far it is, and where the nearest dhaba is."
    ]
  },
  {
    "id": "f3-transport",
    "unitId": "f3",
    "levelId": "foundation",
    "title": "Getting around",
    "fn": "Take public transport or a ride",
    "canDo": "I can take a bus, train, auto or cab and sort out the fare.",
    "phrases": [
      "Does this go to…?",
      "How much to…?",
      "One ticket to…, please",
      "Please stop here",
      "Can you put the meter on?",
      "Where do I get down?",
      "Keep the change"
    ],
    "scenario": "Play an auto or cab driver. The learner tells you where they're going, asks for the meter or checks the fare, and tells you where to stop.",
    "variants": [
      "Play a bus conductor on a crowded city bus. The learner checks if it goes to their stop, buys a ticket, and asks where to get off.",
      "Play a clerk at a railway ticket counter. The learner asks for a ticket, checks the platform and timing, and confirms the fare."
    ],
    "l1Note": "'Where do I get down?' is fine in India; 'get off' is the more standard option. For a taxi, say 'put the meter on', not 'meter only'."
  },
  {
    "id": "f4-requests",
    "unitId": "f4",
    "levelId": "foundation",
    "title": "Simple requests",
    "fn": "Make polite requests",
    "canDo": "I can ask for things politely.",
    "phrases": [
      "Could you…, please?",
      "Would you mind …ing?",
      "Can you help me with…?",
      "Sorry to bother you, but…",
      "Thanks a lot"
    ],
    "scenario": "Set up small everyday situations (pass something, hold a door, help carry) and get them to make polite requests.",
    "variants": [
      "At the office: play a busy colleague. Have the learner politely ask for small work favours - cover a desk, share a charger, swap a shift, send a file - and respond warmly to each.",
      "On a crowded train or bus: play a fellow passenger. The learner politely asks you to shift a bag, swap seats so they can sit with family, or watch their luggage for a minute."
    ]
  },
  {
    "id": "f4-permission",
    "unitId": "f4",
    "levelId": "foundation",
    "title": "Asking permission",
    "fn": "Ask for and give permission",
    "canDo": "I can ask for and give permission.",
    "phrases": [
      "Can I…?",
      "Is it okay if I…?",
      "Do you mind if I…?",
      "Would it be alright to…?",
      "Sure, go ahead"
    ],
    "scenario": "Play a colleague or host; have the learner ask permission for several small things, and respond.",
    "variants": [
      "At a friend's or relative's home: play the host. The learner asks permission for everyday things - use the washroom, charge their phone, take a glass of water, switch on the fan - and you say yes warmly.",
      "At work with a manager: play the boss. The learner asks to leave early, take Friday off, work from home, or step out for a call; sometimes say yes, sometimes ask a gentle follow-up before agreeing."
    ]
  },
  {
    "id": "f4-phone",
    "unitId": "f4",
    "levelId": "foundation",
    "title": "A basic phone call",
    "fn": "Make a simple call",
    "canDo": "I can make a simple phone call to ask or book.",
    "phrases": [
      "Hi, I'm calling about…",
      "I'd like to book…",
      "Could you tell me…?",
      "What time do you…?",
      "Thank you, bye"
    ],
    "scenario": "Play a receptionist. The learner calls to book a table or ask about opening hours; keep it short and clear.",
    "variants": [
      "Play a clinic receptionist. The learner calls to book a doctor's appointment - give them a couple of time slots, ask their name, and confirm the booking.",
      "Play a delivery or courier helpline agent. The learner calls about a parcel - they ask where it is, when it'll arrive, and whether they can change the delivery time."
    ]
  },
  {
    "id": "f4-complaint",
    "unitId": "f4",
    "levelId": "foundation",
    "title": "Polite complaints",
    "fn": "Complain and ask to fix a problem",
    "canDo": "I can politely point out a problem and ask for it to be fixed.",
    "phrases": [
      "Excuse me, there's a small problem with…",
      "This isn't quite right.",
      "I think there's been a mistake.",
      "Could you please replace this?",
      "Sorry, but I'd like to return this.",
      "Can you check this for me?",
      "Could you sort this out for me?"
    ],
    "scenario": "Play a calm shop, restaurant or service staff member. The learner points out a problem - wrong order, faulty item, extra charge on the bill - and asks you to fix it. Stay friendly so they practise complaining without getting angry.",
    "variants": [
      "Play a hotel front-desk person. The learner has just checked in and the room has an issue - AC not working, room not cleaned, wrong room type - and they politely ask you to sort it out.",
      "Play a mobile or internet customer-care agent. The learner calls because their bill is wrong or the connection keeps dropping; they explain the problem and ask you to fix it."
    ],
    "l1Note": "Soften it with 'there's a small problem' or 'I think' instead of 'You did wrong' - it sounds polite, not accusing."
  },
  {
    "id": "f5-past",
    "unitId": "f5",
    "levelId": "foundation",
    "title": "What you did",
    "fn": "Talk about the past",
    "canDo": "I can talk about what I did recently.",
    "phrases": [
      "Yesterday I…",
      "Last weekend, I…",
      "It was great / okay / tiring",
      "I went to…",
      "We had a…"
    ],
    "scenario": "Ask what they did yesterday and last weekend; gently keep them in the past tense.",
    "variants": [
      "Play their cousin on a call: ask how the wedding they attended last week went, and keep them describing it in the past tense.",
      "Be a curious colleague on Monday morning, asking what they did over the long weekend and how the trip back was."
    ],
    "l1Note": "Use the past form: 'I went', not 'I am going', for things that already happened."
  },
  {
    "id": "f5-plans",
    "unitId": "f5",
    "levelId": "foundation",
    "title": "Plans & the future",
    "fn": "Talk about plans",
    "canDo": "I can talk about my plans.",
    "phrases": [
      "I'm going to…",
      "I'm planning to…",
      "Tomorrow I'll…",
      "Hopefully I'll…",
      "I might…"
    ],
    "scenario": "Ask about their plans for tonight, the weekend and the next holiday.",
    "variants": [
      "Play a friend planning the festival season: ask what they're going to do for Diwali and whether they'll travel home.",
      "Be a gym buddy asking about their goals: what they're planning to do differently this month and what they might try next."
    ]
  },
  {
    "id": "f5-invite",
    "unitId": "f5",
    "levelId": "foundation",
    "title": "Invitations",
    "fn": "Invite, accept and decline",
    "canDo": "I can invite someone and accept or decline an invitation.",
    "phrases": [
      "Do you want to…?",
      "Would you like to…?",
      "Sure, I'd love to!",
      "Sounds good",
      "Sorry, I can't make it"
    ],
    "scenario": "Invite them out; have them accept or decline politely, then invite you to something in return.",
    "variants": [
      "Play a neighbour inviting them over for chai and snacks this evening; have them accept warmly, then invite you to something in return.",
      "Be a teammate inviting them to a Sunday cricket match; have them politely decline because they're busy, and suggest another day instead."
    ]
  },
  {
    "id": "f5-experiences",
    "unitId": "f5",
    "levelId": "foundation",
    "title": "Have you ever…?",
    "fn": "Talk about life experiences",
    "canDo": "I can ask and talk about experiences — things I have or haven't done.",
    "phrases": [
      "Have you ever…?",
      "Yes, I have!",
      "No, never",
      "I've … a couple of times",
      "I've always wanted to…",
      "Not yet, but I'd like to"
    ],
    "scenario": "Trade 'Have you ever…?' questions about food, travel and firsts — tried a new cuisine, visited a new city, ridden a bike. Get them to say whether they have or haven't, and react when they ask you back.",
    "variants": [
      "Play a foodie friend: ask whether they've ever tried different dishes or street food, and get them to say which they have and haven't.",
      "Be someone comparing travel: ask if they've ever been to certain cities or done things like a train journey or a flight, and keep them answering with 'I have' / 'I've never'."
    ],
    "l1Note": "Say 'Have you ever been to Goa?' and answer 'Yes, I have' — keep the 'have', don't drop it."
  },
  {
    "id": "i1-icebreak",
    "unitId": "i1",
    "levelId": "intermediate",
    "title": "Breaking the ice",
    "fn": "Start a conversation",
    "canDo": "I can start a friendly conversation with someone new.",
    "phrases": [
      "So, how do you know…?",
      "Have you been here before?",
      "Nice weather, isn't it?",
      "What do you do for fun?",
      "How's your day going?"
    ],
    "scenario": "Play a stranger next to them at an event. Get a natural small-talk going and keep the learner initiating.",
    "variants": [
      "You and the learner are stuck in a slow lift or waiting for a delayed train; play a relaxed fellow-waiter and let them open with a light, situation-based ice-breaker.",
      "You're both early to a wedding and don't know many people; play a guest from the other side and let the learner make the first move."
    ]
  },
  {
    "id": "i1-keepgoing",
    "unitId": "i1",
    "levelId": "intermediate",
    "title": "Keeping it going",
    "fn": "Sustain a conversation",
    "canDo": "I can keep a conversation going with follow-up questions.",
    "phrases": [
      "Oh really? Tell me more",
      "That sounds…",
      "What happened next?",
      "Same here!",
      "And how about you?"
    ],
    "scenario": "Share small things about yourself and get them to react and ask follow-ups so the chat keeps flowing.",
    "variants": [
      "Flip the roles: you mention a small thing (you just got back from a trip, you started a new course) and let the learner keep digging with follow-ups so you do most of the talking.",
      "Over chai on an office break, drop a tiny everyday detail and get them to react and keep the back-and-forth alive instead of letting it die after one line."
    ]
  },
  {
    "id": "i1-wrap-up",
    "unitId": "i1",
    "levelId": "intermediate",
    "title": "Wrapping up smoothly",
    "fn": "Exit small talk gracefully",
    "canDo": "I can end a casual chat warmly without it feeling abrupt.",
    "phrases": [
      "Anyway, I should let you go",
      "It was lovely chatting",
      "I'd better get going",
      "We should catch up again soon",
      "Let's stay in touch",
      "Right, I'll leave you to it",
      "Good luck with everything"
    ],
    "scenario": "Have a short, friendly chat, then signal you need to move on. Get the learner to close the conversation warmly instead of going quiet or just saying a flat 'okay, bye'.",
    "variants": [
      "You're at a party and a mutual friend is waving you over; let the learner wrap up the chat politely before you step away.",
      "A long phone call with a friend is winding down; nudge the learner to ease out of it warmly rather than ending it suddenly."
    ],
    "l1Note": "Soften the exit first ('Anyway, I should get going') before saying bye, so it doesn't feel sudden."
  },
  {
    "id": "i1-compliments",
    "unitId": "i1",
    "levelId": "intermediate",
    "title": "Compliments & reactions",
    "fn": "Give and receive compliments",
    "canDo": "I can give a genuine compliment and accept one gracefully.",
    "phrases": [
      "That really suits you",
      "I love your…",
      "You did a great job with…",
      "Where did you get that?",
      "Oh, thank you so much!",
      "That's so kind of you",
      "I really appreciate that"
    ],
    "scenario": "Notice something nice about the learner (their shirt, their work, a dish they made) and compliment it. Get them to accept it warmly, then give you a genuine compliment back.",
    "variants": [
      "A colleague just nailed a presentation; play them and let the learner praise the work specifically, then handle the thank-you when you compliment them back.",
      "At a family gathering, admire something the learner cooked or wore and coach them to accept the praise warmly instead of brushing it off."
    ],
    "l1Note": "When complimented, just say 'Thank you!' — don't deny it with 'No no, it's nothing', which sounds dismissive in English."
  },
  {
    "id": "i2-opinion",
    "unitId": "i2",
    "levelId": "intermediate",
    "title": "Giving opinions",
    "fn": "Give and support an opinion",
    "canDo": "I can give my opinion and back it up.",
    "phrases": [
      "I think… / In my opinion…",
      "The way I see it…",
      "For example…",
      "That's because…",
      "What do you think?"
    ],
    "scenario": "Pick a light topic (city vs village life, online vs in-person) and get them to give and justify opinions.",
    "variants": [
      "You both just watched the same cricket match or film; ask the learner what they thought and keep nudging them to back up each opinion with a concrete example.",
      "Play a colleague in a tea break: bring up whether work-from-home or office is better, and push the learner to state a clear view and support it with one reason from their own life."
    ]
  },
  {
    "id": "i2-disagree",
    "unitId": "i2",
    "levelId": "intermediate",
    "title": "Agreeing & disagreeing politely",
    "fn": "Disagree without rudeness",
    "canDo": "I can disagree politely.",
    "phrases": [
      "That's a good point, but…",
      "I see what you mean, however…",
      "I'm not so sure about that",
      "Actually, I'd say…",
      "Fair enough"
    ],
    "scenario": "Take mild opposing views on a fun topic and get them to disagree politely and hold their position.",
    "variants": [
      "Play a friend planning a weekend trip who is set on the beach while the learner wants the hills; get them to disagree politely but hold their ground.",
      "Play an uncle at a family dinner insisting kids today waste all their time on phones; get the learner to push back respectfully without sounding rude or caving in."
    ]
  },
  {
    "id": "i2-ask-opinion",
    "unitId": "i2",
    "levelId": "intermediate",
    "title": "Asking what others think",
    "fn": "Invite and draw out someone's opinion",
    "canDo": "I can ask for someone's view and get them to say more.",
    "phrases": [
      "What's your take on this?",
      "How do you feel about it?",
      "Do you agree?",
      "Why do you say that?",
      "What makes you say that?",
      "Any other thoughts?",
      "So you'd rather…?"
    ],
    "scenario": "Play someone with a quiet, short opinion on an everyday topic (the best place to eat nearby, or whether to buy or rent). Make the learner pull your view out of you with follow-up questions instead of just giving their own.",
    "variants": [
      "Play a teammate in a meeting who hasn't spoken yet; the learner is leading and has to invite your opinion, then ask one good follow-up to get the detail.",
      "Play a friend who just shrugs and says 'it's fine' about a new phone; the learner has to dig until you give the real reasons."
    ],
    "l1Note": "Say 'What do you think about it?' not 'What you are thinking?' — keep the normal question word order."
  },
  {
    "id": "i2-weigh-up",
    "unitId": "i2",
    "levelId": "intermediate",
    "title": "Weighing both sides",
    "fn": "Compare options and weigh pros and cons",
    "canDo": "I can weigh up two sides before settling on a view.",
    "phrases": [
      "On one hand…, on the other…",
      "There are pros and cons",
      "The good thing is…",
      "The downside is…",
      "It depends on…",
      "Overall, I'd say…"
    ],
    "scenario": "Give the learner a two-sided choice (buying a car vs taking the metro, a small town vs a big city) and get them to lay out the upsides and downsides of each before leaning one way.",
    "variants": [
      "You're both deciding whether to take a higher-paying job in another city or stay put; get the learner to talk through the trade-offs out loud, not just pick.",
      "Ask the learner whether online classes or a physical classroom is better, and push them to give the plus and minus of each before landing on an answer."
    ]
  },
  {
    "id": "i3-narrate",
    "unitId": "i3",
    "levelId": "intermediate",
    "title": "Telling a story",
    "fn": "Narrate an experience",
    "canDo": "I can tell a short story about something that happened.",
    "phrases": [
      "So, the other day…",
      "At first…",
      "But then…",
      "In the end…",
      "You won't believe what happened"
    ],
    "scenario": "Ask for a recent story (a trip, a funny moment) and help them shape it with a beginning, middle and end.",
    "variants": [
      "They just got back from a wedding that didn't go to plan; play a curious friend and pull out the start, the twist and the ending.",
      "Ask about their first day at a new job or college; help them build it as a clear before, during and after."
    ]
  },
  {
    "id": "i3-detail",
    "unitId": "i3",
    "levelId": "intermediate",
    "title": "Adding colour",
    "fn": "Describe with detail and feeling",
    "canDo": "I can add detail and emotion to a story.",
    "phrases": [
      "It was absolutely…",
      "I was so…",
      "Suddenly…",
      "Honestly, I couldn't believe it",
      "The best part was…"
    ],
    "scenario": "Get them to retell a moment with more vivid detail, emotion and emphasis.",
    "variants": [
      "They saw something at a railway station or bus stop that surprised them; push for the sights, the sounds and how they felt in that moment.",
      "Get them to describe the most delicious meal they've ever eaten, loading it up with taste, smell and emotion."
    ]
  },
  {
    "id": "i3-react",
    "unitId": "i3",
    "levelId": "intermediate",
    "title": "Reacting to a story",
    "fn": "React as an engaged listener",
    "canDo": "I can react naturally while someone tells me a story.",
    "phrases": [
      "Oh no, really?",
      "Then what happened?",
      "That's so funny!",
      "I can't believe it!",
      "Wow, that must've been amazing",
      "Haha, no way!",
      "Glad it worked out"
    ],
    "scenario": "You tell the learner a short, mildly dramatic story (a flight got cancelled, a near-miss on the road) and pause often so they react, gasp and ask 'what next?' to keep you going.",
    "variants": [
      "Tell them a happy story (you finally met an old school friend after years); coach warm, excited reactions.",
      "Share a small frustrating story (the cab driver took the long route on purpose); get them to react with sympathy and curiosity, not just silence."
    ],
    "l1Note": "Indian-English listeners often go quiet to be polite; English expects little 'oh no / really?' sounds to show you're listening."
  },
  {
    "id": "i3-point",
    "unitId": "i3",
    "levelId": "intermediate",
    "title": "Making a point with a story",
    "fn": "Use a story to make a point",
    "canDo": "I can tell a short story to make a point or share a lesson.",
    "phrases": [
      "This reminds me of the time…",
      "Long story short…",
      "And that's when I realised…",
      "The point is…",
      "So now I always…",
      "It just goes to show…"
    ],
    "scenario": "Give the learner a topic like 'never give up' or 'always double-check'; ask them to share a real moment from their life that proves it, then land the lesson at the end.",
    "variants": [
      "Ask them to convince you of an opinion (e.g. mornings are best for work) by telling one quick story instead of just arguing.",
      "They're giving advice to a younger cousin about money; get them to back the advice with a short 'this happened to me' story and a clear takeaway."
    ]
  },
  {
    "id": "i4-introduce-pro",
    "unitId": "i4",
    "levelId": "intermediate",
    "title": "Professional introductions",
    "fn": "Introduce yourself at work",
    "canDo": "I can introduce myself professionally.",
    "phrases": [
      "Hi, I'm … from …",
      "I look after…",
      "I've been with … for…",
      "Great to finally meet you",
      "I've heard a lot about…"
    ],
    "scenario": "Play a new colleague or client; exchange professional introductions, roles and a little context.",
    "variants": [
      "Play a fellow attendee at an industry conference; over chai during the break, swap names, companies and what each of you does.",
      "Play a teammate on a video call as the learner joins a new team on day one; do a quick round of camera-on introductions."
    ]
  },
  {
    "id": "i4-meeting",
    "unitId": "i4",
    "levelId": "intermediate",
    "title": "In a meeting",
    "fn": "Contribute to a meeting",
    "canDo": "I can contribute simply in a meeting.",
    "phrases": [
      "Can I add something?",
      "From my side…",
      "I'd suggest…",
      "Just to confirm…",
      "Shall we…?"
    ],
    "scenario": "Run a tiny team check-in and invite them to give an update and a suggestion.",
    "variants": [
      "Play the lead of a morning stand-up; go round for blockers and nudge the learner to volunteer one idea to unblock someone.",
      "Play a client on a review call; invite the learner to add a point, propose a next step, and confirm what was agreed."
    ]
  },
  {
    "id": "i4-update-progress",
    "unitId": "i4",
    "levelId": "intermediate",
    "title": "Giving a status update",
    "fn": "Report progress on a task",
    "canDo": "I can update someone on how a task is going.",
    "phrases": [
      "So far, I've…",
      "It's pretty much on track",
      "I've nearly finished…",
      "I'm a bit stuck on…",
      "I should be done by…",
      "One thing slowing me down is…",
      "I'll keep you posted"
    ],
    "scenario": "Play the learner's manager asking for a quick update on a task; prompt them for what's done, what's left, and when it'll be ready.",
    "variants": [
      "Play a teammate who's waiting on the learner's part before they can start theirs; ask when it'll be ready and whether anything's blocking it.",
      "Play a client checking in on a delivery; the learner has to admit it's slightly delayed, explain why, and give a new date."
    ],
    "l1Note": "Say 'I've nearly finished' or 'I'm almost done', not 'I am doing the needful'."
  },
  {
    "id": "i4-arrange-meeting",
    "unitId": "i4",
    "levelId": "intermediate",
    "title": "Sorting out a time to meet",
    "fn": "Arrange and reschedule meetings",
    "canDo": "I can fix, change and confirm a time to meet someone.",
    "phrases": [
      "Are you free on…?",
      "Does Tuesday work for you?",
      "Can we push it to…?",
      "Something's come up, so…",
      "Let's make it…",
      "I'll send a calendar invite",
      "Works for me!"
    ],
    "scenario": "Play a colleague trying to find a slot for a quick sync; go back and forth on days and times until the learner pins down a time that works for both of you.",
    "variants": [
      "Play someone the learner had a meeting with today; they need to call and reschedule because something urgent came up, and suggest a new time.",
      "Play a client in a different city; the learner has to find a slot that works across both schedules and confirm whether it's a call or in person."
    ],
    "l1Note": "To move a meeting later, say 'Can we push it to Friday?' or 'move it to Friday'; to move it earlier, say 'bring it forward' or 'move it earlier' — not 'prepone', which isn't used outside India."
  },
  {
    "id": "i5-phone",
    "unitId": "i5",
    "levelId": "intermediate",
    "title": "Phone etiquette",
    "fn": "Handle a phone call",
    "canDo": "I can handle a phone call clearly.",
    "phrases": [
      "Hello, this is …",
      "Could I speak to…?",
      "Sorry, could you repeat that?",
      "Let me just check…",
      "I'll get back to you"
    ],
    "scenario": "Play someone on a call; practise opening, clarifying and closing a call clearly.",
    "variants": [
      "You called a customer-care line and the menu just put you through to a live agent. Play the agent picking up mid-queue; have the learner open clearly with who they are and why they're calling, then close politely.",
      "You're the learner's manager, calling while they're driving with bad signal and the line keeps cutting. Get them to manage the call, ask you to repeat, and offer to call you back from somewhere quieter."
    ]
  },
  {
    "id": "i5-clarify",
    "unitId": "i5",
    "levelId": "intermediate",
    "title": "Clarify & confirm",
    "fn": "Confirm details",
    "canDo": "I can clarify and confirm details like names, numbers and spelling.",
    "phrases": [
      "Could you spell that?",
      "So that's …, correct?",
      "Let me read that back…",
      "Sorry, did you say … or …?",
      "Just to be sure…"
    ],
    "scenario": "Give them a name, an address and a time (a little quickly); get them to confirm and spell things back.",
    "variants": [
      "Play a delivery agent reading out a long order number and a flat address a bit too fast. The learner must catch it, read it back, and fix one digit you deliberately got wrong.",
      "On a video call with patchy audio, give the learner a meeting link, a date and a participant's unusual name. Have them confirm each detail and spell the name back to be sure."
    ]
  },
  {
    "id": "i5-voicemail-message",
    "unitId": "i5",
    "levelId": "intermediate",
    "title": "Leaving a voicemail",
    "fn": "Leave a clear voice message",
    "canDo": "I can leave a short, clear voicemail when someone doesn't pick up.",
    "phrases": [
      "Hi, this is … calling for …",
      "I'm calling about…",
      "Could you call me back on…?",
      "The best time to reach me is…",
      "I'll try you again later, thanks",
      "Just letting you know — no need to call back"
    ],
    "scenario": "Don't pick up the learner's call — let it ring out to your voicemail beep. Prompt them to leave a short message: who they are, why they called, their number, and a clear next step. Keep it under 30 seconds.",
    "variants": [
      "The learner is calling a clinic that has closed for the day to reschedule an appointment; have them leave a voicemail with their name, the reason, and a callback number.",
      "The learner reached a colleague's voicemail just before an urgent deadline; get them to leave a quick message saying what's needed and that no callback is required if it's already done."
    ],
    "l1Note": "Say your phone number slowly and in small groups ('nine-eight … double-seven …'), not as one long rushed string."
  },
  {
    "id": "i5-online-meeting-tech",
    "unitId": "i5",
    "levelId": "intermediate",
    "title": "Handling tech hiccups online",
    "fn": "Manage audio and connection issues on a call",
    "canDo": "I can handle audio, video and connection problems smoothly during an online meeting.",
    "phrases": [
      "Can you hear me okay?",
      "Sorry, you're breaking up a bit",
      "I think you're on mute",
      "Let me just turn my camera on",
      "Can we pause a second? My net's acting up",
      "Should I drop and rejoin?"
    ],
    "scenario": "Run a short video call but drop in small tech glitches — go silent, freeze, or stay on mute. Get the learner to notice, name the problem politely, and suggest a fix so the meeting keeps moving.",
    "variants": [
      "The learner is presenting when their screen-share won't show; have them flag it calmly and keep talking while they sort it out.",
      "You join the learner's call late and can't hear them; play the confused participant and let the learner guide you to check your mute and audio settings."
    ]
  },
  {
    "id": "i6-complain",
    "unitId": "i6",
    "levelId": "intermediate",
    "title": "Complaining politely",
    "fn": "Complain and ask for a fix",
    "canDo": "I can complain politely and ask for a solution.",
    "phrases": [
      "I'm afraid there's a problem with…",
      "This isn't quite what I expected",
      "Would it be possible to…?",
      "I'd appreciate it if…",
      "How can we sort this out?"
    ],
    "scenario": "Play a shop, hotel or support agent; the learner complains about an issue and works towards a fix.",
    "variants": [
      "A food-delivery order arrived cold with an item missing; play the delivery app's chat support agent and work towards a fix.",
      "Brand-new earphones stopped working after two days; play a staffer at the electronics shop counter and handle the warranty complaint."
    ]
  },
  {
    "id": "i6-apologise",
    "unitId": "i6",
    "levelId": "intermediate",
    "title": "Apologising & fixing",
    "fn": "Apologise and offer a fix",
    "canDo": "I can apologise and offer to make things right.",
    "phrases": [
      "I'm really sorry about…",
      "That's my fault",
      "Let me fix that",
      "What can I do to make it right?",
      "It won't happen again"
    ],
    "scenario": "Set up a small mistake the learner made; get them to apologise sincerely and offer a fix.",
    "variants": [
      "The learner forgot to reply to an important client email for two days; play the client and let them apologise and propose a fix.",
      "The learner booked the team meeting at the wrong time and everyone showed up late; play an annoyed colleague and let them own it and set things right."
    ]
  },
  {
    "id": "i6-escalate",
    "unitId": "i6",
    "levelId": "intermediate",
    "title": "Standing firm & escalating",
    "fn": "Push back and ask to escalate",
    "canDo": "I can stay polite but firm and escalate when the first fix isn't enough.",
    "phrases": [
      "That doesn't really solve it, I'm afraid",
      "I'd prefer a refund, honestly",
      "Could I speak to a manager?",
      "I've already tried that",
      "This has happened twice now",
      "What are my options here?",
      "Could I get that in writing?"
    ],
    "scenario": "Play a support agent who first offers a weak fix (a small discount or 'just try again later'); the learner stays polite but firm, pushes back, and asks to escalate to a manager or for a refund.",
    "variants": [
      "The learner has called the bank three times about a wrong charge and keeps getting transferred; play a call-centre agent who stalls, and make them insist on a supervisor.",
      "A hotel offers only a free breakfast for a noisy room with broken AC; play the front-desk manager and let the learner push for a room change or a refund."
    ]
  },
  {
    "id": "i6-chase",
    "unitId": "i6",
    "levelId": "intermediate",
    "title": "Following up on a delay",
    "fn": "Chase something late politely",
    "canDo": "I can follow up on something that's overdue and ask for a clear timeline.",
    "phrases": [
      "I'm just following up on…",
      "Any update on this?",
      "It was supposed to arrive by…",
      "Could you check the status for me?",
      "When can I expect it?",
      "Just a gentle reminder…",
      "Please keep me posted"
    ],
    "scenario": "Something the learner is waiting for is overdue (a parcel, a refund, a reply). Play the person responsible; the learner follows up politely, asks for the status and a clear date.",
    "variants": [
      "The learner's online refund still hasn't shown up after ten days; play the e-commerce support agent and have them chase the status and a firm date.",
      "The landlord still hasn't returned the security deposit a month after move-out; play the landlord on a call and have the learner follow up firmly but politely."
    ]
  },
  {
    "id": "a1-structure",
    "unitId": "a1",
    "levelId": "advanced",
    "title": "Structuring a talk",
    "fn": "Open, body, close",
    "canDo": "I can structure and deliver a short talk.",
    "phrases": [
      "Today I'd like to talk about…",
      "There are three things…",
      "First… / Next… / Finally…",
      "To sum up…",
      "Thanks — any questions?"
    ],
    "scenario": "Ask them to give a one-minute mini-talk on a familiar topic; coach the structure by prompting each section.",
    "variants": [
      "You're a colleague at a team stand-up. Ask them to give a quick one-minute update on a project they're working on, and coach them to open, list the key points, and close cleanly.",
      "Play an audience at a family function. Ask them to give a short toast or thank-you speech, prompting a clear opening, two or three points, and a warm wrap-up."
    ]
  },
  {
    "id": "a1-qa",
    "unitId": "a1",
    "levelId": "advanced",
    "title": "Handling questions",
    "fn": "Field questions",
    "canDo": "I can handle questions after speaking.",
    "phrases": [
      "Great question",
      "If I understand you correctly…",
      "Let me come back to that",
      "To answer directly…",
      "Does that make sense?"
    ],
    "scenario": "They present briefly; you ask a few pointed questions and they handle them calmly.",
    "variants": [
      "They've just finished pitching a small idea to you as their manager. Ask two or three slightly tricky follow-up questions and let them field each one calmly without getting flustered.",
      "Play a curious client after a short product demo. Ask one question they don't fully know the answer to, so they practise buying time and promising to come back to it."
    ]
  },
  {
    "id": "a1-explain-simply",
    "unitId": "a1",
    "levelId": "advanced",
    "title": "Explaining clearly",
    "fn": "Explain something simply",
    "canDo": "I can explain something complex in simple, everyday words.",
    "phrases": [
      "Let me put it simply…",
      "Think of it like…",
      "Basically, what it does is…",
      "In other words…",
      "So, for example…",
      "Does that make it clearer?"
    ],
    "scenario": "Ask them to explain something they know well (their job, an app they use, how UPI works) to you as a complete beginner. Play a little confused so they have to simplify, use an everyday comparison, and check you've understood.",
    "variants": [
      "Play a curious older relative who doesn't use technology. Ask them to explain how online food delivery or booking a cab works, in the simplest terms.",
      "You're a new teammate on day one. Ask them to explain one work process or tool to you from scratch, with a real example."
    ],
    "l1Note": "After explaining, say 'Does that make sense?' rather than 'Did you understand?' — it sounds friendlier and less like a test."
  },
  {
    "id": "a1-recover-gracefully",
    "unitId": "a1",
    "levelId": "advanced",
    "title": "Recovering on the spot",
    "fn": "Recover when something goes wrong",
    "canDo": "I can recover smoothly when I lose my place or something goes wrong while speaking.",
    "phrases": [
      "Sorry, where was I?",
      "Let me start that again…",
      "Bear with me one second…",
      "Just to pick up where I left off…",
      "Let me come back to that point…",
      "Right, so as I was saying…"
    ],
    "scenario": "They're mid-talk on a topic they chose. Interrupt with a small hiccup — a noise, a question, or 'sorry, the screen froze' — so they have to pause, stay calm, and pick the thread back up without panicking.",
    "variants": [
      "Play a listener on a video call where their audio cut out for a moment; nudge them to acknowledge it lightly and resume from where they stopped.",
      "They suddenly blank on a name or a number while presenting. Coach them to buy a moment, move on smoothly, and circle back to it later instead of freezing."
    ],
    "l1Note": "A small 'Sorry, let me start that again' sounds confident, not weak — no need to over-apologise with 'I am extremely sorry'."
  },
  {
    "id": "a2-persuade",
    "unitId": "a2",
    "levelId": "advanced",
    "title": "Making a case",
    "fn": "Persuade",
    "canDo": "I can make a persuasive case.",
    "phrases": [
      "The main benefit is…",
      "Imagine if…",
      "What this means for you is…",
      "Compared to…",
      "Here's why it matters"
    ],
    "scenario": "They pitch an idea (a plan, a place to eat, a tool); push back gently so they have to persuade you.",
    "variants": [
      "You're a busy manager; the learner pitches a new tool or a process change for the team and you keep saying 'we don't really have time for this' until they show you the payoff.",
      "You're a parent; the learner tries to convince you to let them take a trip or make a big purchase, and you raise practical doubts so they have to make the case."
    ]
  },
  {
    "id": "a2-negotiate",
    "unitId": "a2",
    "levelId": "advanced",
    "title": "Negotiating",
    "fn": "Negotiate and push back",
    "canDo": "I can negotiate and push back diplomatically.",
    "phrases": [
      "I see where you're coming from, but…",
      "Could we meet in the middle?",
      "What if we…?",
      "I can offer…",
      "That's a bit difficult for me"
    ],
    "scenario": "Negotiate something (a price, a deadline, a split); hold a position so they must find a middle ground.",
    "variants": [
      "Play a flat owner; the learner wants a lower rent or a longer notice period, and you hold firm on a couple of terms so they have to offer a trade-off.",
      "Play a shopkeeper at a market; the learner haggles over the price of an item and you come down slowly, expecting them to counter and maybe bundle a few things."
    ]
  },
  {
    "id": "a2-buy-in",
    "unitId": "a2",
    "levelId": "advanced",
    "title": "Winning the room over",
    "fn": "Build buy-in from a group",
    "canDo": "I can pitch an idea to a group and bring people on board.",
    "phrases": [
      "Hear me out for a second",
      "I think we'd all agree that…",
      "Where I'm going with this is…",
      "Let me address the obvious concern",
      "What would it take to get you all on board?",
      "Can I count on your support?",
      "So, are we all on the same page?"
    ],
    "scenario": "Play two or three slightly sceptical teammates rolled into one voice. The learner pitches an idea to the 'room' and you raise group-level concerns ('won't this cost more?', 'who'll actually own it?') so they have to bring everyone along, not just win over one person.",
    "variants": [
      "Play a family group call about a holiday plan; the learner proposes a destination and you voice different relatives' doubts so they have to win consensus.",
      "Play a residents' association committee; the learner proposes a change like new gate timings or a shared expense, and you channel mixed reactions from the neighbours."
    ],
    "l1Note": "It's 'on the same page', not 'on the same line' — that's the usual idiom for shared understanding."
  },
  {
    "id": "a2-closing",
    "unitId": "a2",
    "levelId": "advanced",
    "title": "Closing the deal",
    "fn": "Confirm agreement and lock in next steps",
    "canDo": "I can close a discussion by confirming what we agreed and who does what next.",
    "phrases": [
      "So, just to confirm, we're agreed on…",
      "Shall we go ahead, then?",
      "Let's lock that in",
      "Who's doing what, and by when?",
      "I'll send you the details",
      "Sounds like we have a deal",
      "Great — I'll take it from here"
    ],
    "scenario": "You've reached a rough agreement with the learner. Now play the other party and let them drive the close — get them to sum up what was agreed, pin down the next step and who owns it, and confirm it all clearly before you both wrap up.",
    "variants": [
      "Play a freelancer the learner has been discussing a project with; have them close by confirming the scope, the timeline and the very next step.",
      "Play a friend after a long back-and-forth about weekend plans; have the learner pin down the final plan, the time, and who's arranging what."
    ]
  },
  {
    "id": "a3-run",
    "unitId": "a3",
    "levelId": "advanced",
    "title": "Running a meeting",
    "fn": "Lead and align",
    "canDo": "I can run a short meeting and keep it on track.",
    "phrases": [
      "Let's get started",
      "The goal today is…",
      "Let's hear from…",
      "Let's park that for now",
      "So the next steps are…"
    ],
    "scenario": "Have them chair a one-minute meeting with you as a participant who wanders a little; keep them steering.",
    "variants": [
      "Chair a 'standup' where you, the participant, keep drifting into an unrelated project; make them gently pull the meeting back and protect the agenda.",
      "Play two team members talking over each other; the learner is chairing and must bring order, give each person a turn, and move things forward."
    ]
  },
  {
    "id": "a3-feedback",
    "unitId": "a3",
    "levelId": "advanced",
    "title": "Giving feedback",
    "fn": "Give constructive feedback",
    "canDo": "I can give honest feedback kindly.",
    "phrases": [
      "One thing that's working well is…",
      "I'd love to see more of…",
      "Have you considered…?",
      "My honest take is…",
      "What support do you need?"
    ],
    "scenario": "They give you feedback on a piece of work; coach a balance of warmth and honesty.",
    "variants": [
      "You're a junior teammate who's nervous and apologetic about a slip in your report; the learner gives honest feedback while keeping you motivated and not crushed.",
      "You're a confident colleague who thinks the work is perfect; the learner must raise a real issue tactfully without you getting defensive."
    ]
  },
  {
    "id": "a3-delegate",
    "unitId": "a3",
    "levelId": "advanced",
    "title": "Delegating a task",
    "fn": "Hand over work and confirm ownership",
    "canDo": "I can hand over a task clearly and confirm who owns it by when.",
    "phrases": [
      "Could you take the lead on this?",
      "I'd like you to own the whole thing",
      "Just so we're clear, you'll handle…",
      "When do you think you can have it by?",
      "Let me know if you hit any blockers",
      "I'm right here if you need anything"
    ],
    "scenario": "Play a team member the learner manages. They hand a task over to you; coach them to be clear about what, by when, and to check you've understood and feel supported.",
    "variants": [
      "You're an overloaded teammate; the learner must hand you something new while acknowledging your plate is full and agreeing what to drop or push.",
      "You keep saying 'okay, okay' without really committing; the learner must pin down a clear owner, a deadline, and a check-in point."
    ],
    "l1Note": "For deadlines say 'Can you have it by Friday?' — 'by' means on or before, which is exactly what you want."
  },
  {
    "id": "a3-consensus",
    "unitId": "a3",
    "levelId": "advanced",
    "title": "Landing a decision",
    "fn": "Mediate disagreement and reach a shared call",
    "canDo": "I can bring two sides together and land a decision everyone can accept.",
    "phrases": [
      "Let's hear both sides first",
      "So where do we actually agree?",
      "It sounds like the real worry is…",
      "Can we all live with this?",
      "Let's try it and review in a week",
      "Fair enough — can we land on this?"
    ],
    "scenario": "Play two teammates with opposing views on a small choice (which tool to use, where to hold the offsite). The learner mediates, finds common ground, and gets to a decision both can accept.",
    "variants": [
      "The group's gone quiet and nobody will commit; the learner must draw out the silent people and turn vague nods into a clear, agreed choice.",
      "You strongly back option A and won't budge; the learner must hear you out, weigh it fairly, and still guide everyone to a fair call without steamrolling you."
    ]
  },
  {
    "id": "a4-answer",
    "unitId": "a4",
    "levelId": "advanced",
    "title": "Answering interview questions",
    "fn": "Answer common questions",
    "canDo": "I can answer common interview questions with structure.",
    "phrases": [
      "Thanks for asking",
      "In my last role, I…",
      "For example,…",
      "What I learned was…",
      "I'd bring … to this role"
    ],
    "scenario": "Play an interviewer; ask two or three common questions and coach them to answer with situation–action–result.",
    "variants": [
      "Play a panel interviewer for a customer-support role. Fire a behavioural one: 'Tell me about a time you handled an angry customer.' Coach them to walk through the situation, what they did, and how it ended.",
      "Play an HR interviewer asking the classics: 'Why do you want to leave your current job?' and 'Where do you see yourself in five years?'. Keep them positive and structured, and never badmouthing the old employer."
    ]
  },
  {
    "id": "a4-strengths",
    "unitId": "a4",
    "levelId": "advanced",
    "title": "Talking about strengths",
    "fn": "Sell your strengths",
    "canDo": "I can talk about my strengths and experience confidently.",
    "phrases": [
      "One of my strengths is…",
      "I'm particularly good at…",
      "A good example is…",
      "People often say I…",
      "I've consistently…"
    ],
    "scenario": "Ask 'what are your strengths?' and 'why you?'; get them to answer with confidence and evidence.",
    "variants": [
      "Play an interviewer for a team-lead promotion. Ask 'What makes you the right person to lead this team?' and push for a concrete example where they already showed leadership.",
      "Play a startup founder doing a quick hire. Ask 'In one line, why should I pick you over the others?' and get them to sell one sharp strength with proof."
    ]
  },
  {
    "id": "a4-tough-questions",
    "unitId": "a4",
    "levelId": "advanced",
    "title": "Handling tough questions",
    "fn": "Answer weaknesses and gaps",
    "canDo": "I can handle weakness and gap questions without losing confidence.",
    "phrases": [
      "That's a fair question",
      "One area I'm working on is…",
      "I've improved a lot by…",
      "There was a gap because…, and I used that time to…",
      "To be honest with you,…",
      "It's something I'm actively getting better at"
    ],
    "scenario": "Play an interviewer who asks the hard ones: 'What's your biggest weakness?' and 'Why is there a gap in your CV?'. Coach the learner to stay calm, be honest, and turn each answer towards growth — never defensive, never fake.",
    "variants": [
      "Play an interviewer probing a job-hop: 'You've changed jobs three times in two years — why should I trust you'll stay?'. Help them answer steadily and frame it as a search for the right fit.",
      "Play an interviewer questioning a career switch: 'You're from a totally different field — why this role now?'. Coach them to own the change and link past skills to the new job."
    ]
  },
  {
    "id": "a4-ask-the-interviewer",
    "unitId": "a4",
    "levelId": "advanced",
    "title": "Asking the interviewer questions",
    "fn": "Ask smart questions at the end",
    "canDo": "I can ask the interviewer thoughtful questions at the end.",
    "phrases": [
      "I do have a couple of questions",
      "What does success look like in this role?",
      "What's the team like to work with?",
      "What are the biggest challenges right now?",
      "What are the next steps?",
      "Is there anything you'd like me to clarify?"
    ],
    "scenario": "You've nearly finished interviewing the learner. Say 'So, do you have any questions for us?' and play along warmly — answer briefly so they keep asking. Coach them to ask two or three smart questions instead of saying 'no, nothing'.",
    "variants": [
      "Play a hiring manager wrapping up a call. Invite their questions, then have them politely ask about salary range, working hours, and when they'll hear back — without sounding pushy.",
      "Play a future manager in a final round. When they ask 'What's the team like?', mention the team is going through a big reorg — coach them to pick up on that and ask a sharp follow-up about what it means for the role."
    ]
  },
  {
    "id": "a5-natural",
    "unitId": "a5",
    "levelId": "advanced",
    "title": "Sounding natural",
    "fn": "Use natural phrasing",
    "canDo": "I can use natural, everyday phrasing.",
    "phrases": [
      "To be honest…",
      "Kind of / sort of",
      "I guess…",
      "That makes sense",
      "No worries"
    ],
    "scenario": "Have a relaxed free chat and nudge them to use softer, natural connectors instead of textbook English.",
    "variants": [
      "You're two friends catching up over chai about a hectic week at work. Keep it loose and let them lean on natural fillers and softeners ('to be honest', 'kind of', 'I guess') instead of full, formal sentences.",
      "Play a colleague hearing the learner's weekend plans on a casual call. React easily ('that makes sense', 'no worries', 'fair enough') and nudge them away from stiff textbook phrasing toward relaxed connectors."
    ]
  },
  {
    "id": "a5-diplomacy",
    "unitId": "a5",
    "levelId": "advanced",
    "title": "Diplomacy & hedging",
    "fn": "Soften and stay diplomatic",
    "canDo": "I can soften messages and stay diplomatic.",
    "phrases": [
      "It might be worth…",
      "I'm not entirely sure, but…",
      "Perhaps we could…",
      "That could be tricky",
      "I'd lean towards…"
    ],
    "scenario": "Pose slightly tense situations and get them to respond diplomatically, hedging where useful.",
    "variants": [
      "Play a teammate whose deadline has slipped; the learner must flag it to you without sounding harsh. Push them to hedge and soften ('it might be worth…', 'that could be tricky') rather than blaming.",
      "You're a friend asking the learner to honestly review a flat you're about to rent that has real problems. Get them to share their doubts diplomatically instead of bluntly saying it's bad."
    ]
  },
  {
    "id": "a5-idioms",
    "unitId": "a5",
    "levelId": "advanced",
    "title": "Idioms & figurative phrasing",
    "fn": "Use common idioms naturally",
    "canDo": "I can drop everyday idioms and figurative phrases in at the right moment.",
    "phrases": [
      "It's a piece of cake",
      "Let's play it by ear",
      "We're on the same page",
      "It cost a bomb",
      "Long story short…",
      "It was a blessing in disguise",
      "Let's call it a day"
    ],
    "scenario": "Have a relaxed chat about work, money or weekend plans and feed the learner natural openings to slip in a fitting idiom. Coach them to use one or two, not to overstuff, and to notice whether it lands.",
    "variants": [
      "Swap stories about a chaotic trip or a wedding that went sideways; nudge them to wrap up the mess with idioms like 'long story short' or 'it was a blessing in disguise'.",
      "Talk about a recent big purchase or a tight monthly budget; create openings for money idioms ('cost a bomb', 'a real steal') used naturally."
    ],
    "l1Note": "An idiom is fixed — say 'a piece of cake', not 'a piece of the cake'; changing a word makes it sound off."
  },
  {
    "id": "a5-interrupt-repair",
    "unitId": "a5",
    "levelId": "advanced",
    "title": "Breaking in & steering the chat",
    "fn": "Interrupt and redirect smoothly",
    "canDo": "I can break in politely, get the talk back on topic, and recover when I lose my words.",
    "phrases": [
      "Sorry to jump in, but…",
      "Can I add one thing?",
      "Going back to what you said…",
      "Where was I?",
      "What I meant was…",
      "Anyway, as I was saying…",
      "Let's come back to that"
    ],
    "scenario": "Talk a lot and drift off-topic so the learner has to break in politely, pull the chat back to the point, and recover smoothly when they lose their thread. Keep it warm, not a debate.",
    "variants": [
      "Play a relative over-explaining a family function on a group call; the learner needs to cut in gently to add their point, then hand the floor back to you.",
      "Have the learner pitch a quick idea to you while you keep derailing with side questions; coach them to park your tangent ('let's come back to that') and steer back to their main point."
    ],
    "l1Note": "'Sorry to jump in' or 'can I add one thing?' sounds friendlier than a flat 'one minute' or 'listen' when you break in."
  }
];
