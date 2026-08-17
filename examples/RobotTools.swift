// BilaOS Robot — deterministic tool boundary for an iOS robot app.
// MIT License. This is architecture-focused sample code, not a complete app.

import Foundation
import simd

enum RobotMode: String, Codable {
    case disarmed, manual, autonomous, emergencyStop
}

enum RobotIntent: Codable, Equatable {
    case observe
    case stop
    case rotate(degrees: Double)
    case drive(distanceMeters: Double, maxSpeed: Double)
    case goTo(x: Double, z: Double)
}

struct SafetyContext {
    var mode: RobotMode
    var operatorPresent: Bool
    var mapConfidence: Double
    var nearestObstacleMeters: Double
    var batteryPercent: Double
    var linkAgeMilliseconds: Int
}

enum SafetyDecision: Equatable {
    case allow(RobotIntent)
    case requireApproval(reason: String)
    case deny(reason: String)
}

struct SafetyGate {
    let maximumDistanceMeters = 1.5
    let maximumSpeed = 0.25
    let minimumClearanceMeters = 0.45

    func evaluate(_ intent: RobotIntent, in context: SafetyContext) -> SafetyDecision {
        if intent == .stop { return .allow(.stop) }
        guard context.mode != .emergencyStop else {
            return .deny(reason: "E-stop is latched")
        }
        guard context.operatorPresent else {
            return .deny(reason: "Dead-man presence lost")
        }
        guard context.linkAgeMilliseconds < 500 else {
            return .deny(reason: "Control link is stale")
        }
        guard context.batteryPercent > 15 else {
            return .deny(reason: "Battery reserve reached")
        }
        guard context.nearestObstacleMeters >= minimumClearanceMeters else {
            return .deny(reason: "Obstacle inside safety envelope")
        }

        switch intent {
        case let .drive(distance, speed):
            let bounded = RobotIntent.drive(
                distanceMeters: min(max(distance, -maximumDistanceMeters), maximumDistanceMeters),
                maxSpeed: min(max(abs(speed), 0.05), maximumSpeed)
            )
            return abs(distance) > maximumDistanceMeters
                ? .requireApproval(reason: "Long move was split into bounded segments")
                : .allow(bounded)
        case .goTo where context.mapConfidence < 0.75:
            return .requireApproval(reason: "Map confidence is too low for autonomous travel")
        case .rotate, .goTo, .observe:
            return .allow(intent)
        case .stop:
            return .allow(.stop)
        }
    }
}

// Expose only these high-level JSON tool names to the LLM:
// observe_scene, rotate_degrees, drive_meters, go_to_map_point, stop_robot.
// The model never receives BLE, PWM, GPIO or motor-driver tools.
