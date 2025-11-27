import WidgetKit
import SwiftUI

// MARK: - Widget Data Model

struct NoContactWidgetData: Codable {
    let currentStreak: Int
    let longestStreak: Int
    let lastUpdated: String
    let encouragementMessage: String
    let streakMessage: String
    let nextMilestone: Int
    let daysToMilestone: Int
}

// MARK: - Timeline Entry

struct StreakEntry: TimelineEntry {
    let date: Date
    let streak: Int
    let message: String
    let streakMessage: String
    let nextMilestone: Int
    let daysToMilestone: Int
}

// MARK: - Timeline Provider

struct Provider: TimelineProvider {
    private let appGroupID = "group.com.nocontact.app"
    private let widgetDataKey = "@nocontact_widget_data"

    func placeholder(in context: Context) -> StreakEntry {
        StreakEntry(
            date: Date(),
            streak: 0,
            message: "Loading...",
            streakMessage: "Start your journey",
            nextMilestone: 7,
            daysToMilestone: 7
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (StreakEntry) -> ()) {
        let entry = StreakEntry(
            date: Date(),
            streak: 4,
            message: "You're doing great!",
            streakMessage: "Building momentum",
            nextMilestone: 7,
            daysToMilestone: 3
        )
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<StreakEntry>) -> ()) {
        // Read data from App Group shared container
        guard let sharedDefaults = UserDefaults(suiteName: appGroupID),
              let widgetDataString = sharedDefaults.string(forKey: widgetDataKey),
              let widgetDataJson = widgetDataString.data(using: .utf8) else {
            // No data available yet
            let entry = StreakEntry(
                date: Date(),
                streak: 0,
                message: "Open app to sync",
                streakMessage: "Start your journey",
                nextMilestone: 7,
                daysToMilestone: 7
            )
            let timeline = Timeline(entries: [entry], policy: .atEnd)
            completion(timeline)
            return
        }

        do {
            let widgetData = try JSONDecoder().decode(NoContactWidgetData.self, from: widgetDataJson)

            let entry = StreakEntry(
                date: Date(),
                streak: widgetData.currentStreak,
                message: widgetData.encouragementMessage,
                streakMessage: widgetData.streakMessage,
                nextMilestone: widgetData.nextMilestone,
                daysToMilestone: widgetData.daysToMilestone
            )

            // Update every 15 minutes
            let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
            let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))

            completion(timeline)
        } catch {
            // Parsing error - show default
            let entry = StreakEntry(
                date: Date(),
                streak: 0,
                message: "Open app to sync",
                streakMessage: "Start your journey",
                nextMilestone: 7,
                daysToMilestone: 7
            )
            let timeline = Timeline(entries: [entry], policy: .atEnd)
            completion(timeline)
        }
    }
}

// MARK: - Small Widget View

struct SmallWidgetView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 124/255, green: 58/255, blue: 237/255), // #7C3AED
                    Color(red: 109/255, green: 40/255, blue: 217/255)  // #6D28D9
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(spacing: 6) {
                // Streak number
                Text("\(entry.streak)")
                    .font(.system(size: 56, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                    .minimumScaleFactor(0.5)

                // Label
                Text("Days Strong")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.white.opacity(0.9))

                // Encouragement message
                Text(entry.message)
                    .font(.system(size: 10))
                    .foregroundColor(.white.opacity(0.75))
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .padding(.horizontal, 8)
                    .padding(.top, 2)
            }
            .padding()
        }
        .widgetURL(URL(string: "nocontact://home"))
    }
}

// MARK: - Medium Widget View

struct MediumWidgetView: View {
    var entry: Provider.Entry

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 124/255, green: 58/255, blue: 237/255), // #7C3AED
                    Color(red: 109/255, green: 40/255, blue: 217/255)  // #6D28D9
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            HStack(spacing: 20) {
                // Left side - Streak
                VStack(spacing: 4) {
                    Text("\(entry.streak)")
                        .font(.system(size: 52, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                        .minimumScaleFactor(0.5)

                    Text("Days Strong")
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(.white.opacity(0.9))
                }
                .frame(maxWidth: .infinity)

                // Divider
                Rectangle()
                    .fill(Color.white.opacity(0.25))
                    .frame(width: 1)
                    .padding(.vertical, 16)

                // Right side - Message & Progress
                VStack(alignment: .leading, spacing: 8) {
                    Text("Today's Truth")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(.white.opacity(0.65))
                        .textCase(.uppercase)

                    Text(entry.message)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.white)
                        .lineLimit(2)

                    Spacer()

                    // Progress to next milestone
                    HStack(spacing: 4) {
                        Text("\(entry.daysToMilestone)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.white)
                        Text("days to")
                            .font(.system(size: 10))
                            .foregroundColor(.white.opacity(0.7))
                        Text("\(entry.nextMilestone)")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(.white)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
        .widgetURL(URL(string: "nocontact://home"))
    }
}

// MARK: - Widget Entry View (Router)

struct NoContactWidgetEntryView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        default:
            SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Widget Configuration

@main
struct NoContactWidget: Widget {
    let kind: String = "NoContactWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            NoContactWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("No Contact Streak")
        .description("Keep track of your no-contact streak and stay motivated.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Widget Previews

struct NoContactWidget_Previews: PreviewProvider {
    static var previews: some View {
        Group {
            // Small widget preview
            NoContactWidgetEntryView(entry: StreakEntry(
                date: Date(),
                streak: 42,
                message: "You're unstoppable!",
                streakMessage: "One month! Incredible!",
                nextMilestone: 60,
                daysToMilestone: 18
            ))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
            .previewDisplayName("Small Widget")

            // Medium widget preview
            NoContactWidgetEntryView(entry: StreakEntry(
                date: Date(),
                streak: 42,
                message: "Every day of no contact is a day of self-love.",
                streakMessage: "One month! Incredible!",
                nextMilestone: 60,
                daysToMilestone: 18
            ))
            .previewContext(WidgetPreviewContext(family: .systemMedium))
            .previewDisplayName("Medium Widget")

            // Day 1 preview
            NoContactWidgetEntryView(entry: StreakEntry(
                date: Date(),
                streak: 1,
                message: "You've got this!",
                streakMessage: "Day one. You got this.",
                nextMilestone: 7,
                daysToMilestone: 6
            ))
            .previewContext(WidgetPreviewContext(family: .systemSmall))
            .previewDisplayName("Day 1")
        }
    }
}
