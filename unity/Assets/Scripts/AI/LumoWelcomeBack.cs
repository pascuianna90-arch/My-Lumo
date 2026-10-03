using System;
using System.Collections;
using UnityEngine;

namespace MyLumo
{
    public class LumoWelcomeBack : MonoBehaviour
    {
        public LumoEmotionBubble bubble;
        public LumoAnimatorBridge animationBridge;
        public LumoLanguage language = LumoLanguage.Hungarian;
        public float showDelay = 1.5f;

        const string LastSeenKey = "MyLumo.LastSeenUtc";

        IEnumerator Start()
        {
            string previous = PlayerPrefs.GetString(LastSeenKey, "");
            SaveLastSeen();

            if (!DateTime.TryParse(previous, null,
                    System.Globalization.DateTimeStyles.RoundtripKind, out var lastSeen))
                yield break;

            var away = DateTime.UtcNow - lastSeen.ToUniversalTime();

            if (away.TotalHours < 8)
                yield break;

            yield return new WaitForSeconds(showDelay);

            animationBridge?.SetEmotion(LumoEmotion.Happy);

            if (bubble)
                bubble.Show(MessageFor(away));
        }

        string MessageFor(TimeSpan away)
        {
            if (language == LumoLanguage.English)
                return away.TotalDays >= 2
                    ? "I missed you so much... ❤️"
                    : "I'm so happy you're back! ❤️";

            if (language == LumoLanguage.Romanian)
                return away.TotalDays >= 2
                    ? "Mi-a fost tare dor de tine... ❤️"
                    : "Mă bucur mult că te-ai întors! ❤️";

            return away.TotalDays >= 2
                ? "Nagyon hiányoztál... ❤️"
                : "De jó, hogy visszajöttél! ❤️";
        }

        void OnApplicationPause(bool paused)
        {
            if (paused)
                SaveLastSeen();
        }

        void OnApplicationQuit()
        {
            SaveLastSeen();
        }

        void SaveLastSeen()
        {
            PlayerPrefs.SetString(LastSeenKey, DateTime.UtcNow.ToString("O"));
            PlayerPrefs.Save();
        }
    }
}
