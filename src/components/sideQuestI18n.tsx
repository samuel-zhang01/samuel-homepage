import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { toTraditionalMandarin, translateText, type Locale } from "@/lib/i18n";

/**
 * RUN/HACK is deliberately self-contained: the field journal can be opened as a
 * desktop window or as a direct route, so its copy cannot rely on either shell
 * having already translated it. English is the source copy; Chinese locales
 * translate the rendered tree, including accessible names supplied as props.
 */
const zhCN: Record<string, string> = {
  "The day": "这一天",
  "Rules & score": "规则与计分",
  "People & atmosphere": "人群与氛围",
  "What we shipped": "我们做出的产品",

  "MORNING": "早晨",
  "A 5K before the hackathon": "黑客松前先跑 5 公里",
  "Samuel finished a RunThrough 5K in Regent’s Park with Axel Ehrnrooth, Yasmin Akhmedova and Thiruvikraman Anand, then crossed London for a second start line.": "Samuel 与 Axel Ehrnrooth、Yasmin Akhmedova 和 Thiruvikraman Anand 在摄政公园完成 RunThrough 5 公里赛后，又穿过伦敦赶赴第二条起跑线。",
  "The track opened": "跑道开放",
  "More than 100 runners and builders gathered at London Stadium Community Track. There was a DJ, live commentary, food, recovery space and a lot of weather moving in.": "100 多名跑者与开发者聚集在伦敦体育场社区跑道。现场有 DJ、实时解说、食物和恢复区，风雨也正不断袭来。",
  "Run and build": "边跑边开发",
  "The five-and-a-half-hour relay began. Only the teammate out on the 400-metre loop could direct the build; stop running and the event rules required the build to stop too.": "五个半小时的接力正式开始。只有正在 400 米环道上奔跑的队友可以指挥开发；一旦停跑，按规则开发也必须暂停。",
  "Mid-race checkpoint": "赛程中段检查点",
  "Ideas, context and sore legs changed hands. Samuel, Javiera Rubio and Andrés Daniel Godoy Ortiz kept SideQuest moving through phone dictation and repeated handovers.": "想法、上下文和酸痛的双腿在接力中轮番交接。Samuel、Javiera Rubio 与 Andrés Daniel Godoy Ortiz 靠手机口述和一次次换棒，让 SideQuest 持续前进。",
  "The last event-day commit": "活动当天最后一次提交",
  "The sixth hackathon commit landed at 17:54 London time—roughly six minutes before hands-in. The source history makes the deadline visible.": "黑客松第六次代码提交发生在伦敦时间 17:54，距离截止约六分钟。源代码历史把这条期限清楚地留了下来。",
  "Hands off": "停止开发",
  "The run/build window closed. Over the next hour, judges chose the final five; at 19:00 each finalist had five minutes and one screen.": "跑步与开发时段结束。随后一小时，评委选出五支决赛队伍；19:00 起，每队只有五分钟和一块屏幕完成展示。",
  "RESULT": "结果",
  "Second place": "第二名",
  "After 44 additional team kilometres in the rain, SideQuest placed second. The prize mattered; the people and the strange electricity of the day mattered more.": "团队在雨中又跑了 44 公里后，SideQuest 获得第二名。奖项当然重要，但人们与当天那股奇妙的能量更加难忘。",

  "Arrived after a morning 5K and kept building through the rain-soaked relay.": "早晨跑完 5 公里后抵达，并在淋雨接力中持续开发。",
  "Flew in from Milan, supplied the owner-scoped Strava data and applied the necessary peer pressure to join.": "从米兰飞来，提供仅限数据所有者访问的 Strava 数据，也施加了恰到好处的同伴压力促成组队。",
  "Joined without hesitation and became the namesake of SideQuest’s evidence-to-challenge agent.": "毫不犹豫地加入，并成为 SideQuest“从证据到挑战”智能体的名字来源。",

  "Problem": "问题",
  "Problem & customer need": "问题与客户需求",
  "Was the need real, specific and worth solving?": "这个需求是否真实、具体，并值得解决？",
  "Originality ×2": "原创性 ×2",
  "Fun, insight & originality": "趣味、洞察与原创性",
  "The only double-weighted criterion. A surprising rough build could beat a predictable polished dashboard.": "唯一按双倍权重计算的标准。一个粗糙却出人意料的作品，可能胜过精致但可预见的仪表板。",
  "Solution": "解决方案",
  "Solution, product & competition": "解决方案、产品与竞品",
  "Did the product make sense, and did the team understand what already existed?": "产品是否合理，团队是否理解已有方案？",
  "Potential": "潜力",
  "Potential & upside": "潜力与上升空间",
  "Could this idea grow into something people would keep using?": "这个想法能否发展成用户愿意持续使用的产品？",
  "Execution": "执行",
  "Execution & working demo": "执行与可用演示",
  "Did the thing actually work after five and a half hours on the move?": "在移动开发五个半小时后，作品是否真的能运行？",
  "Pitch": "路演",
  "Could the team make the product legible in a five-minute trackside presentation?": "团队能否在跑道边用五分钟把产品讲清楚？",

  "Doors & check-in": "入场与签到",
  "Briefing & warm-up": "说明与热身",
  "Run/build starts": "跑步／开发开始",
  "Checkpoint": "检查点",
  "Thirty-minute warning": "剩余 30 分钟提醒",
  "Hands-in": "截止提交",
  "Final pitches": "决赛路演",
  "Winners": "公布获奖者",

  "Team SideQuest": "SideQuest 团队",
  "Three people, one moving keyboard": "三个人，一块移动的键盘",
  "Samuel Zhang, Javiera Rubio and Andrés Daniel Godoy Ortiz relayed both the running and the product context. The build only progressed while one of them was moving.": "Samuel Zhang、Javiera Rubio 与 Andrés Daniel Godoy Ortiz 同时接力跑步与产品上下文。只有当其中一人在移动时，开发才能继续。",
  "Event makers": "活动组织者",
  "An experiment turned into a community": "一次实验变成一个社区",
  "Tijs Nieuwboer first tried building while running the previous October. The London event was made on the move by Tijs, Siena Kinsale, Luke Balabanovic, Rachel Macnaghten, Abdelaziz ‘Zizou’ Brahmi and Aruzhan N., with Elliott Callender and the crew keeping the day moving.": "Tijs Nieuwboer 在前一年十月首次尝试边跑边开发。Tijs、Siena Kinsale、Luke Balabanovic、Rachel Macnaghten、Abdelaziz“Zizou”Brahmi 与 Aruzhan N. 一起把实验带到伦敦，Elliott Callender 和团队则让整天的活动顺畅运转。",
  "Community": "社区",
  "The part worth remembering": "最值得记住的部分",
  "A loud DJ, constant laps, soaked clothes, founders swapping ideas and an unusually high concentration of people willing to try something unreasonable. Samuel left with more energy than he arrived with; his legs reported a different result.": "响亮的 DJ、不断重复的跑圈、湿透的衣服、交换想法的创始人，以及密集得不寻常的一群愿意尝试不合理之事的人。Samuel 离开时比抵达时更有精神；他的双腿对此有不同意见。",
  "Backers": "支持伙伴",
  "Tools around the loop": "环道周围的工具与支持",
  "The event mixed voice, cloud agents, tracking, connectivity, wellness and go-to-market tools. Their role was to make an unusual format possible—not to become the main story.": "活动结合语音、云端智能体、运动追踪、网络连接、健康与市场推广工具。这些伙伴让不寻常的形式成为可能，但它们并不是故事的主角。",
  "100+ runners & builders": "100 多名跑者与开发者",
  "London startup community": "伦敦创业社区",
  "Rain, music & handovers": "雨、音乐与接力",
  "Elliott + crew": "Elliott 与活动团队",
  "O2 + more": "O2 及更多伙伴",

  "Fill the effort gap": "补齐主观用力感",
  "Does an easy conversational run still feel easy when effort is recorded straight afterwards?": "轻松交谈跑结束后立即记录感受，它是否依然真的轻松？",
  "Run 30 minutes at conversational effort, then record RPE within five minutes.": "以可交谈强度跑 30 分钟，并在五分钟内记录主观用力感（RPE）。",
  "One completed run plus one fresh perceived-effort observation.": "一次已完成的跑步，加一条新鲜的主观用力感记录。",
  "Test pace stability": "测试配速稳定性",
  "Can the next controlled kilometre stay even without chasing a personal best?": "不追求个人最佳成绩时，下一个受控公里能否保持均匀？",
  "Run one controlled kilometre inside a 10-second pace band.": "在 10 秒配速区间内完成一个受控公里。",
  "Finish inside the band without overriding the safety stop.": "在不忽视安全停止条件的前提下完成目标区间。",
  "Protect consistency": "保护训练连续性",
  "Would a deliberately short run make the next week easier to sustain?": "刻意缩短一次跑步，能否让下一周更容易坚持？",
  "Complete a 20-minute easy run and note whether another feels realistic in 48 hours.": "完成 20 分钟轻松跑，并记录 48 小时后再跑一次是否现实。",
  "The observation is recorded; speed is not scored.": "记录观察结果，不对速度评分。",

  "Observe": "观察",
  "Estimate": "估计",
  "Ask": "提问",
  "Intervene": "干预",
  "Rally": "邀请",
  "Reassess": "重新评估",
  "Import aggregate Strava evidence or finish a validated GPS session.": "导入 Strava 汇总证据，或完成一次经过验证的 GPS 运动。",
  "Compare recent and baseline windows while stating coverage and missing fields.": "比较近期与基线时段，并明确数据覆盖范围和缺失字段。",
  "Turn uncertainty into a measurable question, never a diagnosis.": "把不确定性转化为可测量的问题，而不是诊断。",
  "Propose one bounded run with a success measure and explicit safety stop.": "提出一次有明确边界的跑步，包含成功指标和清晰的安全停止条件。",
  "Send the challenge to a friend; pledges are commitments, not payments.": "把挑战发给朋友；认捐代表承诺，并非实际付款。",
  "Store the outcome as new evidence and run the loop again.": "将结果保存为新证据，再次运行循环。",

  "CHAPTER 01 · ON THE TRACK": "第一章 · 跑道之上",
  "One very long Saturday": "一个格外漫长的星期六",
  "The product is the artefact. The relay, the constraint and the people are the story.": "产品是留下的物件；接力、限制与人，才是这个故事。",
  "FIELD LOG": "现场日志",
  "Running Hackathon timeline": "跑步黑客松时间线",
  "Samuel smiling and making a peace sign while moving on the wet track beneath the ArcelorMittal Orbit.": "Samuel 在阿赛洛米塔尔轨道塔下湿滑的跑道上前进，微笑着比出胜利手势。",
  "RAIN LAP · LONDON STADIUM": "雨中跑圈 · 伦敦体育场",
  "“I left with far more energy than I arrived with, despite my legs strongly disagreeing.”": "“尽管双腿强烈反对，我离开时却比抵达时更有能量。”",
  "THE PREMISE": "核心设定",
  "At 12:30, the runner became the only builder.": "12:30 起，跑者成为唯一能开发的人。",
  "Teams of three relayed around the loop. One teammate ran; that runner directed the build. Handover the lap, handover the keyboard.": "三人团队绕环道接力。一名队员奔跑，也只有这名跑者可以指挥开发。交接跑圈，也交接键盘。",
  "01 · BEFORE": "01 · 开始之前",
  "A race before a race": "比赛之前还有一场比赛",
  "The day started with 5K in Regent's Park, not a quiet breakfast and an open laptop.": "这一天从摄政公园 5 公里赛开始，而不是安静的早餐和打开的笔记本电脑。",
  "02 · DURING": "02 · 进行之中",
  "Voice became the interface": "语音成为界面",
  "The team dictated into phones, relayed context and kept moving while rain filled the track.": "团队对着手机口述、接力传递上下文，并在雨水漫上跑道时继续前进。",
  "03 · AROUND IT": "03 · 跑道周围",
  "Music, founders, puddles": "音乐、创始人与水洼",
  "A brilliant DJ and an improbable group of builders turned physical fatigue into communal momentum.": "出色的 DJ 和一群不可思议的开发者，把身体疲惫变成了集体动能。",
  "04 · AFTER": "04 · 结束之后",
  "Something real by sundown": "日落前做出真实的东西",
  "Six event-day commits, one working social running app and a second-place finish.": "活动当天六次代码提交、一款可运行的社交跑步应用，以及第二名。",

  "CHAPTER 02 · THE MECHANIC": "第二章 · 运作机制",
  "Your agents only run when you do": "你跑起来，智能体才能运行",
  "Originality mattered twice. Distance was not decoration; it was part of the score.": "原创性按双倍计分。距离不是装饰，而是成绩的一部分。",
  "INTERACTIVE RELAY": "互动接力",
  "LAP LIVE": "跑圈进行中",
  "LAP PAUSED": "跑圈已暂停",
  "CURRENT RUNNER / CURRENT BUILDER": "当前跑者／当前开发者",
  "Runner moving · voice in · building allowed": "跑者移动中 · 语音输入中 · 允许开发",
  "Runner stopped · building paused under event rules": "跑者已停止 · 按活动规则暂停开发",
  "Pause the lap": "暂停跑圈",
  "Resume the lap": "继续跑圈",
  "Hand over →": "交接 →",
  "Illustrative control: it demonstrates the event rule and does not start a real agent or track a location.": "示意控件：仅用于演示活动规则，不会启动真实智能体，也不会追踪位置。",
  "THE RULES": "规则",
  "Teams of up to three": "每队最多三人",
  "One teammate on the loop at a time.": "每次只有一名队员在环道上。",
  "The runner is the builder": "跑者就是开发者",
  "Calls and screensharing could relay context; the moving teammate directed the build.": "可通过通话和屏幕共享传递上下文；正在移动的队员负责指挥开发。",
  "Switch whenever needed": "按需随时换棒",
  "Unlimited handovers across the 5½-hour window.": "五个半小时内可不限次数交接。",
  "Start from zero": "从零开始",
  "No reused product. First commits and session history could be inspected.": "不得复用已有产品；首次提交和会话历史可供检查。",
  "Keep it moving": "保持移动",
  "The published running threshold was under 7:00/km.": "公布的跑步门槛为每公里 7 分钟以内。",
  "OFFICIAL WORKED EXAMPLE": "官方计算示例",
  "NOT SIDEQUEST'S SCORE": "并非 SIDEQUEST 的得分",
  "BUILD score": "开发得分",
  "Verified team distance": "已验证团队距离",
  "BUILD": "开发",
  "FINAL": "总分",
  "The event pack illustrates the formula with BUILD 30 + 50 km ÷ 2 = 55. SideQuest's exact judge score is not documented. If the reported 44 km matched the verified score distance, it would have contributed 22 points.": "活动资料用“开发 30 分 + 50 公里 ÷ 2 = 55”说明公式。SideQuest 的确切评审分数没有记录；若报道的 44 公里与计分验证距离一致，则可贡献 22 分。",
  "Published BUILD criteria": "已公布的开发评分标准",
  "points": "分",
  "DOUBLE WEIGHT": "双倍权重",
  "BUILD CRITERION": "开发评分标准",
  "Organiser copy says “seven criteria”, while the published table names these six and weights originality twice. Sponsor challenges were scored separately.": "组织方文案称有“七项标准”，但公布的表格列出以上六项，并将原创性按双倍计分。赞助商挑战另行评分。",
  "Event schedule": "活动日程",

  "CHAPTER 03 · THE CROWD": "第三章 · 人群",
  "The best part was everybody else": "最精彩的部分，是身边的每个人",
  "A hackathon can produce a product. This one also produced a temporary little city on a running track.": "黑客松可以产出产品，而这场活动还在跑道上形成了一座临时的小城。",
  "More than 100 runners and builders celebrating together on the London Stadium Community Track.": "100 多名跑者与开发者在伦敦体育场社区跑道上一同庆祝。",
  "ONE LOOP · 100+ PEOPLE": "一条环道 · 100 多人",
  "Together on the London Stadium Community Track.": "在伦敦体育场社区跑道上相聚。",
  "Photo shared by Samuel Zhang.": "照片由 Samuel Zhang 分享。",
  "Event credits": "活动鸣谢",
  "SECOND PLACE": "第二名",
  "A lovely signal—not the point of the day.": "令人欣喜的肯定，却不是这一天的重点。",
  "£500 cash prize": "£500 现金奖金",
  "3 × WHOOP One 5.0": "3 × WHOOP One 5.0",
  "3 × Healf blood kits": "3 × Healf 血液检测套装",
  "$1,000 Thrad credits": "$1,000 Thrad 额度",
  "4 months Devin Max per teammate*": "每名队员 4 个月 Devin Max*",
  "*The Devin award is reported in Samuel's event post; it is not listed in the official prize table preserved in the source pack.": "*Devin 奖励来自 Samuel 的活动帖文；源资料包保存的官方奖项表并未列出此项。",
  "Open the event backers & community ledger": "展开活动支持伙伴与社区名录",
  "EVENT BACKERS & TOOLS": "活动支持伙伴与工具",
  "ROXFIT / Traccar tracked movement; O2 kept the track connected; Wispr Flow and ElevenLabs supported voice; Cognition and Poke brought agents and messaging; Healf and Hyperice supported recovery; Deepline and Tavily covered traction and data. Additional backers: The Interaction Company · Thrad · algosoup · Delfa · Accelerate ME · PerfectTed.": "ROXFIT／Traccar 追踪运动；O2 保障跑道网络；Wispr Flow 与 ElevenLabs 支持语音；Cognition 与 Poke 提供智能体和消息服务；Healf 与 Hyperice 支持恢复；Deepline 与 Tavily 提供增长与数据工具。其他支持伙伴：The Interaction Company · Thrad · algosoup · Delfa · Accelerate ME · PerfectTed。",
  "COMMUNITY SUPPORT": "社区支持",
  "Unicorn Mafia · Pitchless Community / Poke.com · Security Builders Club": "Unicorn Mafia · Pitchless Community／Poke.com · Security Builders Club",
  "TRACKSIDE CONNECTIONS": "跑道边结识的伙伴",
  "Anshul Yadav · Joseph Anthony · Samuel Klacman · Joakim Talling-Smith · Luke Balabanovic · Jack Rees · and many more": "Anshul Yadav · Joseph Anthony · Samuel Klacman · Joakim Talling-Smith · Luke Balabanovic · Jack Rees · 以及更多朋友",

  "CHAPTER 04 · THE ARTEFACT": "第四章 · 留下的作品",
  "SideQuest, built between laps": "SideQuest，在一次次跑圈之间完成",
  "A social running app that turns private activity evidence into measurable friend challenges and a privacy-aware live run.": "一款社交跑步应用，把私密活动证据转化为可测量的好友挑战与注重隐私的跑步直播。",
  "Read the evidence": "读取证据",
  "Owner-scoped Strava aggregates; raw routes never became portfolio assets.": "仅限所有者访问的 Strava 汇总数据；原始路线从未成为作品集资源。",
  "Ask a better question": "提出更好的问题",
  "Turn missing context into one bounded subsequent run—not a diagnosis.": "把缺失的上下文转化为一次有边界的后续跑步，而不是诊断。",
  "Bring a friend live": "邀请朋友实时加入",
  "Ephemeral camera, coarsened route, cheers and an accept-or-decline challenge.": "临时摄像画面、粗化路线、喝彩，以及可接受或拒绝的挑战。",
  "SideQuest feature demos": "SideQuest 功能演示",
  "Strava evidence": "Strava 证据",
  "Subsequent run": "后续跑步",
  "Live relay": "实时接力",
  "PRIVATE STRAVA ADAPTER": "私密 STRAVA 适配器",
  "READ ONLY": "只读",
  "usable activities": "可用活动",
  "with heart rate": "含心率",
  "with perceived effort": "含主观用力感",
  "These documented counts belong to Javi's owner-scoped export—not Samuel's running history. Coverage describes available evidence; it is not a health or fitness score.": "这些已记录的数量来自 Javi 仅限所有者访问的导出数据，并非 Samuel 的跑步历史。覆盖率只描述可用证据，不代表健康或体能评分。",
  "TRY THE DATA SHAPE": "试用数据结构",
  "BROWSER ONLY": "仅限浏览器",
  "Add a hypothetical subsequent run": "添加一次假设的后续跑步",
  "Nothing is uploaded or stored. This demonstrates how a new GPS run joined the same neutral observation contract.": "不会上传或储存任何内容。这里演示一次新的 GPS 跑步如何接入同一套中立观察数据协议。",
  "Distance": "距离",
  "Moving time": "运动时间",
  "Effort": "用力感",
  "Normalise this run": "标准化本次跑步",
  "No browser observation added yet.": "尚未添加浏览器观察记录。",
  "Enter a positive distance and time, with effort from 1 to 10.": "请输入大于零的距离和时间，并将用力感设为 1 至 10。",
  "AGENT GODOY": "GODOY 智能体",
  "NON-DIAGNOSTIC": "非诊断用途",
  "FRIEND CHALLENGE": "好友挑战",
  "DRAFT": "草稿",
  "SENT": "已发送",
  "ACCEPTED": "已接受",
  "DECLINED": "已拒绝",
  "Choose a question": "选择一个问题",
  "Question": "问题",
  "Bounded run": "有边界的跑步",
  "Success": "成功标准",
  "Safety stop": "安全停止条件",
  "Stop for chest discomfort, dizziness, faintness, unusual breathlessness or concerning pain. Stopping safely counts.": "如出现胸部不适、头晕、晕厥感、异常气短或令人担忧的疼痛，请立即停止。安全停下也算完成。",
  "Send to a friend": "发送给朋友",
  "Accept": "接受",
  "Decline": "拒绝",
  "Reset challenge": "重置挑战",
  "Draft · nothing has been sent": "草稿 · 尚未发送任何内容",
  "Sent · the runner decides": "已发送 · 由跑者决定",
  "Accepted · ready to measure": "已接受 · 可以开始测量",
  "Declined · no penalty": "已拒绝 · 没有惩罚",
  "The SideQuest live prototype showing a runner’s camera, GPS distance, pace, time and privacy-safe abstract route.": "SideQuest 实时原型展示跑者摄像画面、GPS 距离、配速、时间与保护隐私的抽象路线。",
  "EVENT-DAY PROTOTYPE": "活动当天原型",
  "Javi live on the track, with a camera, GPS metrics and an abstract route.": "Javi 在跑道上直播，画面包含摄像、GPS 指标与抽象路线。",
  "INTERACTIVE PORTFOLIO REPLAY": "互动作品集回放",
  "● LIVE": "● 直播中",
  "FINISHED": "已结束",
  "PAUSED": "已暂停",
  "READY": "就绪",
  "This reconstruction never requests camera, microphone or location. The original camera relay was ephemeral and the external event deployment may not always be online.": "此重建演示绝不会请求摄像头、麦克风或位置权限。原始摄像接力是临时传输，外部活动部署也不保证始终在线。",
  "ROTATED, COARSENED GEOMETRY": "旋转并粗化的几何路线",
  "NEXT-KILOMETRE CHALLENGE": "下一公里挑战",
  "Hold an even pace · £9 pledge to Mind": "保持均匀配速 · 向 Mind 承诺捐赠 £9",
  "No payment is charged.": "不会实际扣款。",
  "Live pace": "实时配速",
  "Time": "时间",
  "Restart replay": "重新开始回放",
  "Run replay again": "再次运行回放",
  "Start live replay": "开始实时回放",
  "Replay controls": "回放控制",
  "Pause replay": "暂停回放",
  "Resume replay": "继续回放",
  "Rewind": "回到起点",
  "Next point": "下一个节点",
  "Reduced motion: use Next point, or Resume replay to play.": "已减少动态效果：请选择“下一个节点”逐步查看，或“继续回放”自动播放。",
  "Send a cheer": "发送喝彩",
  "Send challenge": "发送挑战",
  "Open technical field notes & prototype boundaries": "展开技术现场笔记与原型边界",
  "DATA": "数据",
  "Private, owner-scoped Strava export; 209 aggregate runs belonged to Javi. Raw routes were never browser assets.": "私密且仅限所有者访问的 Strava 导出；209 次汇总跑步属于 Javi。原始路线从未成为浏览器资源。",
  "SUBSEQUENT RUNS": "后续跑步",
  "Validated live GPS samples were normalised into the same distance, time, pace, effort and freshness contract, then reassessed.": "经过验证的实时 GPS 样本被标准化为同一套距离、时间、配速、用力感与新鲜度协议，再重新评估。",
  "LIVE": "实时",
  "Authenticated WebSocket sessions relayed ephemeral camera chunks. Spectators saw an abstracted route; cheers and challenge decisions persisted.": "经过身份验证的 WebSocket 会话转发临时摄像片段。观众看到的是抽象路线；喝彩与挑战决定会被保留。",
  "HONEST LIMITS": "如实说明边界",
  "The hackathon guest flow was not production authentication, pledge commitments did not charge money, and the live relay was designed for limited event concurrency.": "黑客松访客流程并非生产级身份验证，认捐承诺不会扣款，实时接力也只按活动期间的有限并发量设计。",
  "Original event deployment ↗": "原始活动部署 ↗",
  "SideQuest source ↗": "SideQuest 源代码 ↗",

  "Sam's Cabinet of Curiosities · Latest field note": "Sam 的好奇心陈列柜 · 最新现场记录",
  "29 AUG 2026": "2026 年 8 月 29 日",
  "RUN/HACK FIELD JOURNAL": "跑步黑客松现场记录",
  "2ND PLACE": "第二名",
  "London Stadium · 400 m loop · 5½ hours": "伦敦体育场 · 400 米环道 · 5½ 小时",
  "Running wasn't the break. It was the only time we could build.": "跑步不是休息，而是我们唯一能开发的时间。",
  "After a morning 5K, Samuel joined Javiera Rubio and Andrés Daniel Godoy Ortiz at an event billed as Europe's first running hackathon. Only the teammate on the track could direct the build. Through rain, phone dictation and 44 additional team kilometres, they shipped SideQuest.": "早晨跑完 5 公里后，Samuel 与 Javiera Rubio、Andrés Daniel Godoy Ortiz 会合，参加这场号称欧洲首届的跑步黑客松。只有跑道上的队员能指挥开发。他们在雨中用手机口述，团队又跑了 44 公里，最终做出 SideQuest。",
  "See how the hack worked": "了解黑客松如何运作",
  "Replay what we shipped": "回放我们做出的产品",
  "Morning prelude": "早晨序章",
  "RunThrough, Regent's Park": "RunThrough，摄政公园",
  "Team relay": "团队接力",
  "run + build in the rain": "在雨中跑步并开发",
  "runners and builders": "跑者与开发者",
  "Result": "结果",
  "2nd": "第 2 名",
  "Samuel and another participant using their phones while moving around the London Stadium Community Track.": "Samuel 与另一名参与者一边绕伦敦体育场社区跑道移动，一边使用手机。",
  "BUILDING IN MOTION": "移动中开发",
  "The track was the workstation. Photo shared by Samuel Zhang.": "跑道就是工作台。照片由 Samuel Zhang 分享。",
  "RUN/HACK field journal": "跑步黑客松现场记录",
  "Source-grounded RUN/HACK field journal · documentary photos shared by Samuel Zhang": "以来源为依据的跑步黑客松现场记录 · 纪实照片由 Samuel Zhang 分享",
  "Official event ↗": "活动官方网站 ↗",
  "Samuel's field note ↗": "Samuel 的现场笔记 ↗",
};

const traditionalPhrases: Array<[string, string]> = [
  ["人工智能", "人工智慧"],
  ["源代码", "原始碼"],
  ["代码提交", "程式碼提交"],
  ["代码", "程式碼"],
  ["应用", "應用程式"],
  ["数据所有者", "資料擁有者"],
  ["数据", "資料"],
  ["信息", "資訊"],
  ["实时", "即時"],
  ["网络连接", "網路連線"],
  ["网络", "網路"],
  ["视频", "影片"],
  ["摄像画面", "攝影畫面"],
  ["摄像头", "攝影機"],
  ["摄像", "攝影"],
  ["智能体", "代理程式"],
  ["开发者", "開發者"],
  ["开发", "開發"],
  ["构建", "建置"],
  ["标准化", "標準化"],
  ["标准", "標準"],
  ["用户", "使用者"],
  ["储存", "儲存"],
  ["源资料包", "來源資料包"],
  ["资料", "資料"],
  ["帖子", "貼文"],
  ["帖文", "貼文"],
  ["浏览器", "瀏覽器"],
  ["界面", "介面"],
  ["字段", "欄位"],
  ["配速区间", "配速區間"],
  ["公里赛", "公里賽"],
  ["访问", "存取"],
  ["消息服务", "訊息服務"],
  ["增长", "成長"],
  ["汇总", "彙總"],
  ["导出", "匯出"],
  ["记录", "紀錄"],
  ["报道", "報導"],
];

function toTraditional(text: string) {
  let translated = text;
  traditionalPhrases.forEach(([from, to]) => { translated = translated.replaceAll(from, to); });
  return toTraditionalMandarin(translated)
    .replaceAll("“", "「")
    .replaceAll("”", "」");
}

export function translateSideQuestText(locale: Locale, text: string) {
  if (locale === "en-GB") return text;
  if (locale === "en-US") return translateText(locale, text);

  const leading = text.match(/^\s*/)?.[0] ?? "";
  const trailing = text.match(/\s*$/)?.[0] ?? "";
  const source = text.trim();
  let translated = zhCN[source];

  if (!translated) {
    const timelineMatch = source.match(/^(.+): (.+)$/);
    if (timelineMatch && zhCN[timelineMatch[2]]) {
      translated = `${zhCN[timelineMatch[1]] ?? timelineMatch[1]}：${zhCN[timelineMatch[2]]}`;
    } else if (/^Abstract replay route with \d+ points$/.test(source)) {
      const points = source.match(/\d+/)?.[0] ?? "0";
      translated = `包含 ${points} 个节点的抽象回放路线`;
    } else if (/^Send .+ cheer$/.test(source)) {
      translated = `发送${source.slice(5, -6)}喝彩`;
    }
  }

  if (!translated) return text;
  const localized = locale === "zh-TW" ? toTraditional(translated) : translated;
  return `${leading}${localized}${trailing}`;
}

const translatedProps = ["alt", "aria-label", "title", "placeholder", "chapter", "intro"] as const;

/** Translate a complete component-owned JSX tree without touching stable IDs or values. */
export function localizeSideQuestTree(locale: Locale, node: ReactNode): ReactNode {
  if (typeof node === "string") return translateSideQuestText(locale, node);
  if (!isValidElement(node)) return node;

  const element = node as ReactElement<Record<string, unknown>>;
  const props = element.props;
  const updates: Record<string, unknown> = {};

  translatedProps.forEach((name) => {
    if (typeof props[name] === "string") updates[name] = translateSideQuestText(locale, props[name]);
  });

  if ("children" in props) {
    updates.children = Children.map(props.children as ReactNode, (child) => localizeSideQuestTree(locale, child));
  }

  return cloneElement(element, updates);
}
