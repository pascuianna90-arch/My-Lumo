using TMPro;
using UnityEngine;
using UnityEngine.UI;

namespace MyLumo
{
    public class MyLumoHudController : MonoBehaviour
    {
        [Header("Game")]
        public LumoNeeds needs;
        public LumoProgression progression;
        public CommandExecutor executor;

        [Header("Needs")]
        public Slider hunger;
        public Slider energy;
        public Slider hygiene;
        public Slider happiness;
        public Slider social;

        [Header("Progress")]
        public Slider xp;
        public TMP_Text levelText;
        public TMP_Text coinText;
        public TMP_Text commandStatusText;

        void Update()
        {
            if (needs)
            {
                Set(hunger, needs.hunger.value);
                Set(energy, needs.energy.value);
                Set(hygiene, needs.hygiene.value);
                Set(happiness, needs.happiness.value);
                Set(social, needs.social.value);
            }

            if (progression)
            {
                if (xp)
                {
                    xp.minValue = 0f;
                    xp.maxValue = 1f;
                    xp.value = progression.LevelProgress01;
                }

                if (levelText) levelText.text = $"LVL {progression.level}";
                if (coinText) coinText.text = progression.lumoCoins.ToString();
            }

            if (commandStatusText && executor)
                commandStatusText.text = executor.IsBusy ? executor.CurrentCommand : "Lumo";
        }

        static void Set(Slider slider, float value)
        {
            if (!slider) return;
            slider.minValue = 0f;
            slider.maxValue = 100f;
            slider.value = value;
        }

        public void FeedLumo() => executor?.Enqueue("Egyél pizzát");
        public void SleepLumo() => executor?.Enqueue("Menj aludni");
        public void BatheLumo() => executor?.Enqueue("Menj fürdeni");
        public void DressLumo() => executor?.Enqueue("Vegyél fel egy sapkát");
        public void DanceLumo() => executor?.Enqueue("Táncolj");
    }
}
