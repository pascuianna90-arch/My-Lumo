using TMPro;
using UnityEngine;

namespace MyLumo
{
    public class LumoCommandInput : MonoBehaviour
    {
        public TMP_InputField input;
        public CommandExecutor executor;

        public void Submit()
        {
            if (!input || !executor) return;

            string command = input.text?.Trim();

            if (string.IsNullOrWhiteSpace(command))
                return;

            executor.Enqueue(command);
            input.text = "";
            input.ActivateInputField();
        }
    }
}
