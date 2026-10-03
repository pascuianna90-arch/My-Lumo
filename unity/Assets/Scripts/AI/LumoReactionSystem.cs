using UnityEngine;

namespace MyLumo
{
    public enum LumoLanguage
    {
        Hungarian,
        English,
        Romanian
    }

    public class LumoReactionSystem : MonoBehaviour
    {
        public LumoController lumo;
        public LumoEmotionBubble bubble;
        public LumoLanguage language = LumoLanguage.Hungarian;

        void OnEnable()
        {
            if (lumo) lumo.TaskCompleted += OnTaskCompleted;
        }

        void OnDisable()
        {
            if (lumo) lumo.TaskCompleted -= OnTaskCompleted;
        }

        void OnTaskCompleted(LumoTask task)
        {
            if (!bubble || task == null) return;

            var emotion = EmotionFor(task.action);
            lumo.animationBridge?.SetEmotion(emotion);
            bubble.Show(MessageFor(task.action));
        }

        LumoEmotion EmotionFor(LumoActionType action)
        {
            return action switch
            {
                LumoActionType.Eat => LumoEmotion.Grateful,
                LumoActionType.Sleep => LumoEmotion.Sleepy,
                LumoActionType.Bathe => LumoEmotion.Happy,
                LumoActionType.Dress => LumoEmotion.Excited,
                LumoActionType.Dance => LumoEmotion.Excited,
                LumoActionType.PetAnimal => LumoEmotion.Happy,
                LumoActionType.PlayGuitar => LumoEmotion.Happy,
                _ => LumoEmotion.Neutral
            };
        }

        string MessageFor(LumoActionType action)
        {
            if (language == LumoLanguage.English)
            {
                return action switch
                {
                    LumoActionType.Eat => "Thank you! ❤️",
                    LumoActionType.Sleep => "Good night... 💤",
                    LumoActionType.Bathe => "I feel so fresh! ✨",
                    LumoActionType.Dress => "I love this! 😍",
                    LumoActionType.Dance => "I'm so happy! 🎵",
                    LumoActionType.PetAnimal => "We are friends! ❤️",
                    LumoActionType.PlayGuitar => "Listen to this! 🎸",
                    _ => "I'm happy you're here. ❤️"
                };
            }

            if (language == LumoLanguage.Romanian)
            {
                return action switch
                {
                    LumoActionType.Eat => "Mulțumesc! ❤️",
                    LumoActionType.Sleep => "Noapte bună... 💤",
                    LumoActionType.Bathe => "Ce bine mă simt! ✨",
                    LumoActionType.Dress => "Îmi place mult! 😍",
                    LumoActionType.Dance => "Sunt fericit! 🎵",
                    LumoActionType.PetAnimal => "Suntem prieteni! ❤️",
                    LumoActionType.PlayGuitar => "Ascultă! 🎸",
                    _ => "Mă bucur că ești aici. ❤️"
                };
            }

            return action switch
            {
                LumoActionType.Eat => "Köszönöm! ❤️",
                LumoActionType.Sleep => "Jó éjt... 💤",
                LumoActionType.Bathe => "De jó frissnek lenni! ✨",
                LumoActionType.Dress => "Nagyon tetszik! 😍",
                LumoActionType.Dance => "Nagyon boldog vagyok! 🎵",
                LumoActionType.PetAnimal => "Barátok lettünk! ❤️",
                LumoActionType.PlayGuitar => "Hallgasd ezt! 🎸",
                _ => "Jó, hogy itt vagy. ❤️"
            };
        }
    }
}
