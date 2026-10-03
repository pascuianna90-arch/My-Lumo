using System;
using UnityEngine;

namespace MyLumo
{
    [Serializable]
    public class NeedValue
    {
        [Range(0, 100)] public float value = 80;
        public float drainPerMinute = 1;

        public void Tick(float minutes) =>
            value = Mathf.Clamp(value - drainPerMinute * minutes, 0, 100);

        public void Add(float amount) =>
            value = Mathf.Clamp(value + amount, 0, 100);
    }

    public class LumoNeeds : MonoBehaviour
    {
        public NeedValue hunger = new() { value = 75, drainPerMinute = 2 };
        public NeedValue energy = new() { value = 85, drainPerMinute = 1.2f };
        public NeedValue happiness = new() { value = 80, drainPerMinute = .5f };
        public NeedValue hygiene = new() { value = 90, drainPerMinute = .35f };
        public NeedValue social = new() { value = 75, drainPerMinute = .45f };

        void Update()
        {
            float minutes = Time.deltaTime / 60f;
            hunger.Tick(minutes);
            energy.Tick(minutes);
            happiness.Tick(minutes);
            hygiene.Tick(minutes);
            social.Tick(minutes);
        }

        public void AteMeal()
        {
            hunger.Add(40);
            happiness.Add(5);
        }

        public void Slept()
        {
            energy.Add(65);
            happiness.Add(6);
        }

        public void Bathed()
        {
            hygiene.Add(70);
            happiness.Add(7);
        }

        public void Danced()
        {
            happiness.Add(22);
            energy.Add(-10);
        }

        public void Socialized()
        {
            social.Add(35);
            happiness.Add(12);
        }
    }
}
