import heapq
from datetime import datetime
import requests
import json

API_URL = "http://4.224.186.213/evaluation-service/notifications"

TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJuYXZuZWV0Lm1ha2thZDIwMjNAc3NpcG10LmNvbSIsImV4cCI6MTc4MDkwNDIwNSwiaWF0IjoxNzgwOTAzMzA1LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNzBlOWE3MGMtODFmYy00OWFmLTlkZjctYmMxZmQ3ZDQwMDU5IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoibmF2bmVldCBtYWtrYWQiLCJzdWIiOiI2NzYyYzkyYy1iNjQ4LTQ3NWYtODYwZi0wZDFmNjBkNTAzMzkifSwiZW1haWwiOiJuYXZuZWV0Lm1ha2thZDIwMjNAc3NpcG10LmNvbSIsIm5hbWUiOiJuYXZuZWV0IG1ha2thZCIsInJvbGxObyI6IjMwMzMwMjIyMzE0OCIsImFjY2Vzc0NvZGUiOiJhR0JUSloiLCJjbGllbnRJRCI6IjY3NjJjOTJjLWI2NDgtNDc1Zi04NjBmLTBkMWY2MGQ1MDMzOSIsImNsaWVudFNlY3JldCI6ImNUeW5QV0hQc3F4Y3dmZVoifQ.jvFBkaylbgykIDUomgufEHc3J9c367q2P8UTyuMUF0U"

TYPE_WEIGHT = {
    "Placement": 3,
    "Result": 2,
    "Event": 1
}


def calculate_score(notification):
    weight = TYPE_WEIGHT.get(notification.get("Type"), 0)

    timestamp = datetime.strptime(
        notification["Timestamp"],
        "%Y-%m-%d %H:%M:%S"
    )

    epoch = timestamp.timestamp()

    return weight * 1_000_000_000 + epoch


def get_top_notifications(notifications, top_n=10):
    heap = []

    for notification in notifications:
        score = calculate_score(notification)

        if len(heap) < top_n:
            heapq.heappush(heap, (score, notification))
        else:
            if score > heap[0][0]:
                heapq.heapreplace(heap, (score, notification))

    result = [item[1] for item in heap]

    result.sort(
        key=calculate_score,
        reverse=True
    )

    return result


def main():
    try:
        response = requests.get(
            API_URL,
            headers={
                "Authorization": f"Bearer {TOKEN}"
            },
            timeout=30
        )

        print("Status Code:", response.status_code)
        print("\nRAW RESPONSE:\n")
        print(response.text[:1000])

        data = response.json()

        print("\nPARSED JSON:\n")
        print(json.dumps(data, indent=2))

        # Find notifications safely
        if "notifications" in data:
            notifications = data["notifications"]

        elif "data" in data and "notifications" in data["data"]:
            notifications = data["data"]["notifications"]

        else:
            print("\nERROR: 'notifications' key not found")
            print("Available Keys:", list(data.keys()))
            return

        top_10 = get_top_notifications(
            notifications,
            10
        )

        print("\n==============================")
        print("TOP 10 PRIORITY NOTIFICATIONS")
        print("==============================\n")

        for idx, n in enumerate(top_10, start=1):
            print(
                f"{idx}. "
                f"{n['Type']} | "
                f"{n['Message']} | "
                f"{n['Timestamp']}"
            )

    except Exception as e:
        print("\nERROR OCCURRED:")
        print(str(e))


if __name__ == "__main__":
    main()