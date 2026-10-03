using System;
using UnityEngine;

namespace MyLumo
{
    public class LumoProgression : MonoBehaviour
    {
        [Min(1)] public int level = 1;
        [Min(0)] public int experience;
        [Min(0)] public int lumoCoins;

        public event Action Changed;
        public event Action<int> LevelUp;

        public int ExperienceForNextLevel =>
            Mathf.Max(100, Mathf.RoundToInt(100f * Mathf.Pow(1.14f, level - 1)));

        public float LevelProgress01 =>
            ExperienceForNextLevel <= 0 ? 0f : Mathf.Clamp01((float)experience / ExperienceForNextLevel);

        public void AddExperience(int amount)
        {
            if (amount <= 0) return;

            experience += amount;

            while (experience >= ExperienceForNextLevel)
            {
                experience -= ExperienceForNextLevel;
                level++;
                lumoCoins += 10;
                LevelUp?.Invoke(level);
            }

            Changed?.Invoke();
        }

        public void AddCoins(int amount)
        {
            if (amount == 0) return;
            lumoCoins = Mathf.Max(0, lumoCoins + amount);
            Changed?.Invoke();
        }
    }
}
