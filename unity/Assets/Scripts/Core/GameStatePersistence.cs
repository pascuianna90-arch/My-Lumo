using System;
using System.IO;
using UnityEngine;

namespace MyLumo
{
    [Serializable]
    public class LumoSaveData
    {
        public int location;
        public float hunger;
        public float energy;
        public float happiness;
        public float hygiene;
        public float social;
        public OutfitState outfit;
        public int level = 1;
        public int experience;
        public int lumoCoins;
    }

    public class GameStatePersistence : MonoBehaviour
    {
        public static GameStatePersistence Instance { get; private set; }

        public LumoController lumo;

        string SavePath => Path.Combine(Application.persistentDataPath, "my_lumo_save.json");

        void Awake()
        {
            Instance = this;
        }

        void Start()
        {
            Load();
        }

        public void SaveNow()
        {
            if (!lumo || !lumo.needs || !lumo.inventory) return;

            var data = new LumoSaveData
            {
                location = (int)lumo.currentLocation,
                hunger = lumo.needs.hunger.value,
                energy = lumo.needs.energy.value,
                happiness = lumo.needs.happiness.value,
                hygiene = lumo.needs.hygiene.value,
                social = lumo.needs.social.value,
                outfit = lumo.inventory.outfit
            };

            if (lumo.progression)
            {
                data.level = lumo.progression.level;
                data.experience = lumo.progression.experience;
                data.lumoCoins = lumo.progression.lumoCoins;
            }

            File.WriteAllText(SavePath, JsonUtility.ToJson(data, true));
        }

        public void Load()
        {
            if (!File.Exists(SavePath) || !lumo || !lumo.needs || !lumo.inventory)
                return;

            var data = JsonUtility.FromJson<LumoSaveData>(File.ReadAllText(SavePath));

            lumo.currentLocation = (LumoLocation)data.location;
            lumo.needs.hunger.value = data.hunger;
            lumo.needs.energy.value = data.energy;
            lumo.needs.happiness.value = data.happiness;
            lumo.needs.hygiene.value = data.hygiene;
            lumo.needs.social.value = data.social;

            if (data.outfit != null)
                lumo.inventory.outfit = data.outfit;

            if (lumo.progression)
            {
                lumo.progression.level = Mathf.Max(1, data.level);
                lumo.progression.experience = Mathf.Max(0, data.experience);
                lumo.progression.lumoCoins = Mathf.Max(0, data.lumoCoins);
            }
        }

        void OnApplicationPause(bool paused)
        {
            if (paused) SaveNow();
        }

        void OnApplicationQuit()
        {
            SaveNow();
        }
    }
}
