using TMPro;
using UnityEngine;

namespace MyLumo
{
    public class LumoChatWallController : MonoBehaviour
    {
        public TMP_InputField input;
        public LumoChatClient chatClient;
        public TMP_Text statusText;

        void Update()
        {
            if (!statusText || !chatClient) return;

            if (chatClient.IsSending)
                statusText.text = "Lumo gondolkodik...";
            else if (!string.IsNullOrWhiteSpace(chatClient.LastError))
                statusText.text = "A chat most nem elérhető.";
            else
                statusText.text = "Beszélj Lumóval";
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
    }
}
