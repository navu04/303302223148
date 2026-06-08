import axios from "axios";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJuYXZuZWV0Lm1ha2thZDIwMjNAc3NpcG10LmNvbSIsImV4cCI6MTc4MDkwMTg1NCwiaWF0IjoxNzgwOTAwOTU0LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiMmZkZWQ1NmQtMTg0Ni00MTQ2LTk0ZjMtNjJhZmVmZGYzOWYzIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoibmF2bmVldCBtYWtrYWQiLCJzdWIiOiI2NzYyYzkyYy1iNjQ4LTQ3NWYtODYwZi0wZDFmNjBkNTAzMzkifSwiZW1haWwiOiJuYXZuZWV0Lm1ha2thZDIwMjNAc3NpcG10LmNvbSIsIm5hbWUiOiJuYXZuZWV0IG1ha2thZCIsInJvbGxObyI6IjMwMzMwMjIyMzE0OCIsImFjY2Vzc0NvZGUiOiJhR0JUSloiLCJjbGllbnRJRCI6IjY3NjJjOTJjLWI2NDgtNDc1Zi04NjBmLTBkMWY2MGQ1MDMzOSIsImNsaWVudFNlY3JldCI6ImNUeW5QV0hQc3F4Y3dmZVoifQ.LNK9DBFTk2l643_GdYyi0vz5Z1BrT-o330sMG6Hrqls";

const priority = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

async function getTopNotifications() {
  try {
    const response = await axios.get(
      "http://4.224.186.213/evaluation-service/notifications",
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }
    );

    const notifications = response.data.notifications;

    notifications.sort((a, b) => {
      const p1 = priority[a.Type] || 0;
      const p2 = priority[b.Type] || 0;

      if (p1 !== p2) {
        return p2 - p1;
      }

      return new Date(b.Timestamp) - new Date(a.Timestamp);
    });

    const top10 = notifications.slice(0, 10);

    console.log("===== TOP 10 PRIORITY NOTIFICATIONS =====");

    top10.forEach((n, index) => {
      console.log(
        `${index + 1}. ${n.Type} | ${n.Message} | ${n.Timestamp}`
      );
    });

  } catch (err) {
    console.error(
      "Error:",
      err.response?.status,
      err.response?.data || err.message
    );
  }
}

getTopNotifications();