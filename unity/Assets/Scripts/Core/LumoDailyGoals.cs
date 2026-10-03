using System;
using System.Collections.Generic;
using UnityEngine;

namespace MyLumo
{
    [Serializable]
    public class DailyGoal
    {
        public string id;
        public string title;
        public LumoActionType requiredAction;
        public int target = 1;
        public int progress;
        public int xpReward = 25;
        public int coinReward = 5;

        public bool IsComplete => progress >= target;
    }

    public class LumoDailyGoals : MonoBehaviour
    {
        public LumoController lumo;
        public LumoProgression progression;

        public List<DailyGoal> goals = new()
        {
            new DailyGoal
            {
                id = "care_eat",
                title = "Etess meg Lumót",
                requiredAction = LumoActionType.Eat,
                xpReward = 25,
                coinReward = 5
            },
            new DailyGoal
            {
                id = "care_bath",
                title = "Fürdesd meg Lumót",
                requiredAction = LumoActionType.Bathe,
                xpReward = 25,
                coinReward = 5
            },
            new DailyGoal
            {
                id = "style",
                title = "Adj Lumóra egy ruhát",
                requiredAction = LumoActionType.Dress,
                xpReward = 30,
                coinReward = 6
            }
        };

        public event Action GoalsChanged;

        const string DateKey = "MyLumo.DailyGoals.Date";

        void OnEnable()
        {
            ResetIfNewDay();

            if (lumo)
                lumo.TaskCompleted += OnTaskCompleted;
        }

        void OnDisable()
        {
            if (lumo)
                lumo.TaskCompleted -= OnTaskCompleted;
        }

        void OnTaskCompleted(LumoTask task)
        {
            if (task == null) return;

            ResetIfNewDay();

            foreach (var goal in goals)
            {
                if (goal.IsComplete || goal.requiredAction != task.action)
                    continue;

                goal.progress = Mathf.Min(goal.target, goal.progress + 1);

                if (goal.IsComplete && progression)
                {
                    progression.AddExperience(goal.xpReward);
                    progression.AddCoins(goal.coinReward);
                }
            }

            SaveProgress();
            GoalsChanged?.Invoke();
        }

        void ResetIfNewDay()
        {
            string today = DateTime.UtcNow.ToString("yyyy-MM-dd");

            if (PlayerPrefs.GetString(DateKey, "") == today)
            {
                LoadProgress();
                return;
            }

            PlayerPrefs.SetString(DateKey, today);

            foreach (var goal in goals)
                goal.progress = 0;

            SaveProgress();
        }

        void SaveProgress()
        {
            foreach (var goal in goals)
                PlayerPrefs.SetInt($"MyLumo.DailyGoals.{goal.id}", goal.progress);

            PlayerPrefs.Save();
        }

        void LoadProgress()
        {
            foreach (var goal in goals)
                goal.progress = PlayerPrefs.GetInt($"MyLumo.DailyGoals.{goal.id}", 0);
        }
    }
}
