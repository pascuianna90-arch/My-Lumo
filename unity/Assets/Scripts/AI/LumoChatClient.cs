using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace MyLumo
{
    [Serializable]
    public class LumoChatRequest
    {
        public string user;
        public string message;
        public string sessionId;
    }

    [Serializable]
    public class LumoChatResponse
    {
        public int id;
        public string user;
        public string message;
        public string reply;
        public string createdAt;
        public string error;
    }

    public class LumoChatClient : MonoBehaviour
    {
        [Tooltip("Railway backend base URL, without trailing slash.")]
        public string baseUrl = "https://my-lumo-production.up.railway.app";
        public string playerName = "Játékos";
        public LumoEmotionBubble bubble;
        public LumoAnimatorBridge animationBridge;

        public bool IsSending { get; private set; }
        public string LastError { get; private set; }

        string sessionId;

        void Awake()
        {
            sessionId = PlayerPrefs.GetString("MyLumo.Chat.SessionId", "");

            if (string.IsNullOrWhiteSpace(sessionId))
            {
                sessionId = Guid.NewGuid().ToString("N");
                PlayerPrefs.SetString("MyLumo.Chat.SessionId", sessionId);
                PlayerPrefs.Save();
            }
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

            var payload = new LumoChatRequest
            {
                user = string.IsNullOrWhiteSpace(playerName) ? "Játékos" : playerName.Trim(),
                message = message,
                sessionId = sessionId
            };

            string json = JsonUtility.ToJson(payload);

            using var request = new UnityWebRequest(baseUrl.TrimEnd('/') + "/api/chat", "POST");
            request.uploadHandler = new UploadHandlerRaw(Encoding.UTF8.GetBytes(json));
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.timeout = 25;

            yield return request.SendWebRequest();

            if (request.result != UnityWebRequest.Result.Success)
            {
                LastError = request.downloadHandler?.text;
                if (string.IsNullOrWhiteSpace(LastError))
                    LastError = request.error;

                bubble?.Show("Most nem tudok válaszolni... 🥺");
                IsSending = false;
                yield break;
            }

            var response = JsonUtility.FromJson<LumoChatResponse>(request.downloadHandler.text);

            if (response == null || string.IsNullOrWhiteSpace(response.reply))
            {
                LastError = response?.error ?? "Üres válasz.";
                bubble?.Show("Most nem tudok válaszolni... 🥺");
                IsSending = false;
                yield break;
            }

            animationBridge?.SetEmotion(LumoEmotion.Happy);
            bubble?.Show(response.reply, 5.5f);

            IsSending = false;
        }
    }
}
