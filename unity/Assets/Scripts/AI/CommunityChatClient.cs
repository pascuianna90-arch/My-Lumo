using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace MyLumo
{
    [Serializable]
    public class CommunityChatMessage
    {
        public int id;
        public string user;
        public string message;
        public string country;
        public string createdAt;
    }

    [Serializable]
    public class CommunityChatListResponse
    {
        public CommunityChatMessage[] messages;
    }

    [Serializable]
    public class CommunityChatPostRequest
    {
        public string user;
        public string message;
        public string country;
        public string sessionId;
    }

    [Serializable]
    public class CommunityChatReportRequest
    {
        public int messageId;
        public string sessionId;
        public string reason;
    }

    public class CommunityChatClient : MonoBehaviour
    {
        [Tooltip("Railway backend base URL, without trailing slash.")]
        public string baseUrl = "https://my-lumo-production.up.railway.app";
        public string playerName = "Játékos";
        public string country = "🌍";
        [Min(1f)] public float refreshSeconds = 3f;

        public bool IsSending { get; private set; }
        public string LastError { get; private set; } = "";
        public CommunityChatMessage[] Messages { get; private set; } = Array.Empty<CommunityChatMessage>();

        public event Action MessagesChanged;

        string sessionId;
        Coroutine pollingRoutine;

        void Awake()
        {
            sessionId = PlayerPrefs.GetString("MyLumo.CommunityChat.SessionId", "");

            if (string.IsNullOrWhiteSpace(sessionId))
            {
                sessionId = Guid.NewGuid().ToString("N");
                PlayerPrefs.SetString("MyLumo.CommunityChat.SessionId", sessionId);
                PlayerPrefs.Save();
            }
        }

        void OnEnable()
        {
            pollingRoutine = StartCoroutine(PollLoop());
        }

        void OnDisable()
        {
            if (pollingRoutine != null)
            {
                StopCoroutine(pollingRoutine);
                pollingRoutine = null;
            }
        }

        IEnumerator PollLoop()
        {
            while (true)
            {
                yield return Refresh();
                yield return new WaitForSecondsRealtime(refreshSeconds);
            }
        }

        public IEnumerator Refresh()
        {
            using var request = UnityWebRequest.Get(baseUrl.TrimEnd('/') + "/api/community-chat?limit=50");
            request.timeout = 15;

            yield return request.SendWebRequest();

            if (request.result != UnityWebRequest.Result.Success)
            {
                LastError = request.error;
                yield break;
            }

            var response = JsonUtility.FromJson<CommunityChatListResponse>(request.downloadHandler.text);
            Messages = response?.messages ?? Array.Empty<CommunityChatMessage>();
            LastError = "";
            MessagesChanged?.Invoke();
        }

        public void Send(string message)
        {
            if (IsSending || string.IsNullOrWhiteSpace(message))
                return;

            StartCoroutine(SendRoutine(message.Trim()));
        }

        IEnumerator SendRoutine(string message)
        {
            IsSending = true;
            LastError = "";

            var payload = new CommunityChatPostRequest
            {
                user = string.IsNullOrWhiteSpace(playerName) ? "Játékos" : playerName.Trim(),
                message = message,
                country = string.IsNullOrWhiteSpace(country) ? "🌍" : country.Trim(),
                sessionId = sessionId
            };

            using var request = CreateJsonPost(
                baseUrl.TrimEnd('/') + "/api/community-chat",
                JsonUtility.ToJson(payload));

            yield return request.SendWebRequest();

            if (request.result != UnityWebRequest.Result.Success)
            {
                LastError = ReadServerError(request);
                IsSending = false;
                yield break;
            }

            IsSending = false;
            yield return Refresh();
        }

        public void Report(int messageId, string reason = "other")
        {
            if (messageId <= 0) return;
            StartCoroutine(ReportRoutine(messageId, reason));
        }

        IEnumerator ReportRoutine(int messageId, string reason)
        {
            var payload = new CommunityChatReportRequest
            {
                messageId = messageId,
                sessionId = sessionId,
                reason = string.IsNullOrWhiteSpace(reason) ? "other" : reason.Trim()
            };

            using var request = CreateJsonPost(
                baseUrl.TrimEnd('/') + "/api/community-chat/report",
                JsonUtility.ToJson(payload));

            yield return request.SendWebRequest();

            if (request.result != UnityWebRequest.Result.Success)
                LastError = ReadServerError(request);
        }

        static UnityWebRequest CreateJsonPost(string url, string json)
        {
            var request = new UnityWebRequest(url, "POST");
            request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(json));
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.timeout = 20;
            return request;
        }

        static string ReadServerError(UnityWebRequest request)
        {
            string body = request.downloadHandler?.text;
            return string.IsNullOrWhiteSpace(body) ? request.error : body;
        }
    }
}
