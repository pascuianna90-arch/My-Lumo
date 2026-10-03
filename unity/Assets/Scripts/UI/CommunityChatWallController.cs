using System.Text;
using TMPro;
using UnityEngine;

namespace MyLumo
{
    public class CommunityChatWallController : MonoBehaviour
    {
        public CommunityChatClient chatClient;
        public TMP_InputField input;
        public TMP_Text wallText;
        public TMP_Text statusText;

        void OnEnable()
        {
            if (chatClient)
                chatClient.MessagesChanged += Render;

            Render();
        }

        void OnDisable()
        {
            if (chatClient)
                chatClient.MessagesChanged -= Render;
        }

        void Update()
        {
            if (!statusText || !chatClient) return;

            if (chatClient.IsSending)
                statusText.text = "Küldés...";
            else if (!string.IsNullOrWhiteSpace(chatClient.LastError))
                statusText.text = "A közösségi chat most nem elérhető.";
            else
                statusText.text = "Közösségi chat";
        }

        public void Send()
        {
            if (!input || !chatClient) return;

            string message = input.text?.Trim();
            if (string.IsNullOrWhiteSpace(message)) return;

            chatClient.Send(message);
            input.text = "";
            input.ActivateInputField();
        }

        public void ReportMessage(int messageId)
        {
            chatClient?.Report(messageId, "player_report");
        }

        void Render()
        {
            if (!wallText || !chatClient) return;

            var builder = new StringBuilder();
            var messages = chatClient.Messages;

            for (int i = 0; i < messages.Length; i++)
            {
                var item = messages[i];
                if (item == null) continue;

                if (!string.IsNullOrWhiteSpace(item.country))
                    builder.Append(item.country).Append(' ');

                builder.Append("<b>")
                    .Append(Escape(item.user))
                    .Append("</b>: ")
                    .Append(Escape(item.message));

                if (i < messages.Length - 1)
                    builder.AppendLine().AppendLine();
            }

            wallText.text = builder.ToString();
        }

        static string Escape(string value)
        {
            if (string.IsNullOrEmpty(value)) return "";
            return value
                .Replace("&", "&amp;")
                .Replace("<", "&lt;")
                .Replace(">", "&gt;");
        }
    }
}
