# 🧭 BilaOS Robot — Bản đồ 30 nguồn tham khảo

> Cập nhật: 2026-08-17. Danh sách này là bản đồ học tập, không phải tuyên bố rằng mọi nguồn đều là một robot tự hành hoàn chỉnh. Luôn đọc README, issue, release và giấy phép upstream trước khi dùng mã.

## A. Robot lõi, thao tác và mô phỏng

| # | Nguồn | Dùng để học | Giới hạn / lưu ý |
|---:|---|---|---|
| 1 | [trzy/RoBart](https://github.com/trzy/RoBart) | iPhone Pro + ARKit + BLE + occupancy map + LLM + WebRTC teleop | Thiết kế cơ khí một chiếc; navigation còn thử nghiệm |
| 2 | [trzy/robot-arm](https://github.com/trzy/robot-arm) | Pose iPhone → IK, thu demonstration, ACT imitation learning | Cánh tay 4-DoF, không phải navigation 2WD |
| 3 | [CommandAGI BYO Robot](https://github.com/CommandAGI/commandagi-example-byo-robot) | Camera callback + action callback, rover ảo, realtime session | Dịch vụ/SDK bridge; Safety Gate vẫn phải ở robot |
| 4 | [CommandAGI Python SDK](https://github.com/CommandAGI/commandagi-python) | Môi trường robot 3D, observe/step/reset, action vocabulary | Mô phỏng cloud không thay kiểm thử phần cứng |
| 5 | [craigfouts/robotnik](https://github.com/craigfouts/robotnik) | Webots warehouse và giao diện tri thức cho hai robot mô phỏng | `craigfouts/robart` hiện chuyển hướng tới repo này; không liên quan `trzy/RoBart` |
| 6 | [CemaniHomesteadRobot](https://github.com/nicedreamzapp/CemaniHomesteadRobot) | Kiến trúc xe xích lớn, Jetson, YOLO, LiDAR và điều khiển bằng tin nhắn | Hệ 1 kW rủi ro cao; chỉ nghiên cứu kiến trúc, không phải cấu hình người mới |

## B. Agent và cầu nối điều khiển iPhone

| # | Nguồn | Dùng để học | Giới hạn / lưu ý |
|---:|---|---|---|
| 7 | [rounak/PhoneAgent](https://github.com/rounak/PhoneAgent) | SwiftUI agent loop, XCTest/RPC bridge, iOS/Android | UI automation, không có motor safety/navigation |
| 8 | [ghost-in-the-droid/android-agent](https://github.com/ghost-in-the-droid/android-agent) | iOS qua Appium/WDA, Android qua ADB, tool surface và skill | iOS cần Mac/Xcode/WDA; tên repo dễ làm hiểu nhầm chỉ hỗ trợ Android |
| 9 | [droidrun/mobilerun](https://github.com/droidrun/mobilerun) | Agent quan sát UI, chạm/vuốt/gõ, workflow đa bước | Lớp điều khiển thiết bị; phải có adapter riêng tới robot |
| 10 | [mobile-next/mobile-mcp](https://github.com/mobile-next/mobile-mcp) | MCP accessibility-first cho iOS/Android thật và giả lập | iOS thật cần go-ios, WDA và tunnel |
| 11 | [ShawnPana/phone-harness](https://github.com/ShawnPana/phone-harness) | iPhone Mirroring + Vision OCR + HID, không jailbreak | Mac-only; OCR không phải semantic tree; không thay app ARKit/BLE |
| 12 | [hyechow/GUIWeave](https://github.com/hyechow/GUIWeave) | Vòng lặp milestone → act → verify/replan trên iPhone Mirroring | Repo cũ `iphone-use` chuyển sang tên này; vẫn là GUI agent trên Mac |
| 13 | [zai-org/Open-AutoGLM](https://github.com/zai-org/Open-AutoGLM) | Phone agent, Android/HarmonyOS và hướng dẫn iOS qua WDA | Phụ thuộc model service/cấu hình thiết bị; không phải motion controller |
| 14 | [rotbit/chatgpt-robot](https://github.com/rotbit/chatgpt-robot) | Siri/Shortcuts và kênh hội thoại làm cửa vào nhiệm vụ | Không chứa navigation hay firmware motor |
| 15 | [AI-in-hindsight/gpt-embodiment-robot](https://github.com/AI-in-hindsight/gpt-embodiment-robot) | Khung ghép iPhone + MacBook + Arduino + GPT API | README rất ngắn; cần tự audit mã và phụ thuộc |

## C. AI chạy cục bộ, VLA và thị giác

| # | Nguồn | Dùng để học | Giới hạn / lưu ý |
|---:|---|---|---|
| 16 | [gclsoft/PhoneClaw](https://github.com/gclsoft/PhoneClaw) | Agent Swift chạy model Gemma cục bộ, skill files, quyền iOS | Agent cá nhân; muốn điều khiển robot phải viết tool adapter + Safety Gate |
| 17 | [claude-world/agentOS](https://github.com/claude-world/agentOS) | iPhone agent host, tool-use, Keychain, approval/privacy hook | Hệ agent tổng quát, không phải navigation stack |
| 18 | [BitVLA-CoreAI](https://huggingface.co/mlboydaisuke/BitVLA-CoreAI) | VLA on-device: ảnh + lệnh → action end-effector 7-DoF | Cho manipulation; artifact phụ thuộc thiết bị/toolchain; không thay planner 2WD |
| 19 | [Youtu-LLM-2B-CoreAI](https://huggingface.co/mlboydaisuke/Youtu-LLM-2B-CoreAI) | LLM 2B/tool-use chạy on-device qua Apple Core AI | Là planner ngôn ngữ, không tự nhìn hay điều khiển motor; đọc kỹ license |
| 20 | [tencent/Youtu-LLM-2B](https://huggingface.co/tencent/Youtu-LLM-2B) | Model gốc để hiểu khả năng reasoning/tool-use và license | Không phải VLA; cần runtime/chuyển đổi phù hợp thiết bị |
| 21 | [RealTimeAICam](https://github.com/nicedreamzapp/RealTimeAICam) | CoreML/YOLO, OCR, LiDAR depth và inference offline | Kiểm tra dual-license trước khi phân phối thương mại |
| 22 | [VisionBuilder](https://github.com/nicedreamzapp/VisionBuilder) | Thu ảnh → segment → embed → cluster → gắn nhãn → COCO/YOLO | Upstream tự ghi rõ đang WIP; dùng như pipeline tham khảo |
| 23 | [BitVLA paper](https://arxiv.org/abs/2506.07530) | Thiết kế VLA ternary và đánh giá compression/latency | Bài báo nghiên cứu, không phải app iOS hoàn chỉnh |

## D. Runtime, fleet và bản đồ nghiên cứu

| # | Nguồn | Dùng để học | Giới hạn / lưu ý |
|---:|---|---|---|
| 24 | [craigm26/OpenCastor](https://github.com/craigm26/OpenCastor) | Runtime embodied AI, driver abstraction, safety gate, audit/fleet | Hệ sinh thái phát triển nhanh; xác minh release, claim và threat model trước khi dùng |
| 25 | [OpenCastor Fleet UI](https://github.com/craigm26/opencastor-client) | Telemetry, consent, audit, chat control và E-stop trên dashboard | Cloud/Firebase là lựa chọn kiến trúc, không bắt buộc cho BilaOS local-first |
| 26 | [GT-RIPL/Awesome-LLM-Robotics](https://github.com/GT-RIPL/Awesome-LLM-Robotics) | Chỉ mục reasoning, planning, navigation, manipulation và safety | Danh mục paper, không phải sản phẩm chạy ngay |

## E. Tư liệu lịch sử và thảo luận

| # | Nguồn | Dùng để học | Giới hạn / lưu ý |
|---:|---|---|---|
| 27 | [Hackaday 2012 — iPhone for its brain](https://hackaday.com/2012/06/09/autonomous-robot-uses-an-iphone-for-its-brain/) | Mẫu sớm: iPhone + Arduino + video stream + object detection | Công nghệ cũ; dùng để hiểu lịch sử kiến trúc |
| 28 | [Hackaday 2018 — maps rooms with iPhone](https://hackaday.com/2018/07/14/robot-maps-rooms-with-help-from-iphone/) | iPhone + Unity cho điều khiển và lập bản đồ 3D | Bài viết tổng quan; lần theo source gốc trước khi dùng |
| 29 | [Hackaday 2021 — Romo + Raspberry Pi](https://hackaday.com/2021/07/21/giving-control-of-a-smartphone-robot-to-a-raspberry-pi/) | Reverse engineering giao tiếp robot điện thoại và vòng đời phần cứng | Bài viết ghi mã lúc đó chưa công bố; không phải dependency |
| 30 | [Hacker News — RoBart discussion](https://news.ycombinator.com/item?id=42246353) | Phản biện cộng đồng về kiến trúc, chi phí và khả năng mở rộng | Thảo luận thứ cấp, không thay tài liệu kỹ thuật gốc |

## Các liên kết đã được chuẩn hóa

- `hyechow/iphone-use` hiện được GitHub chuyển hướng sang `hyechow/GUIWeave`.
- `craigfouts/robart` hiện được GitHub chuyển hướng sang `craigfouts/robotnik` và không liên quan tới `trzy/RoBart`.
- Link tổ chức `CommandAGI` được thay bằng hai repo cụ thể: BYO Robot và Python SDK.
- Trang hồ sơ `nicedreamzapp/nicedreamzapp` được thay bằng ba repo kỹ thuật cụ thể: CemaniHomesteadRobot, RealTimeAICam và VisionBuilder.
- Các URL chỉ trỏ tới trang chủ/blog/search chung, chưa xác định được bài/repo cụ thể, không được dùng làm bằng chứng kỹ thuật trong khóa học.
