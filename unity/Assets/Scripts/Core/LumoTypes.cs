using System;
using UnityEngine;

namespace MyLumo
{
    public enum LumoLocation
    {
        Home, Bedroom, LivingRoom, Kitchen, Bathroom, Wardrobe, Yard,
        City, ClothingShop, PizzaShop, Park, Beach, Mountains
    }

    public enum LumoActionType
    {
        None, Move, Eat, Sleep, Bathe, Dance, Dress, PlayGuitar,
        PetAnimal, EnterCar, ExitCar, Build, Idle
    }

    public enum LumoEmotion
    {
        Neutral = 0,
        Happy = 1,
        Grateful = 2,
        Excited = 3,
        Sleepy = 4,
        Sad = 5
    }

    [Serializable]
    public class LumoTask
    {
        public LumoActionType action;
        public LumoLocation location;
        public string itemId;
        public string targetId;
        [TextArea] public string sourceText;

        public LumoTask(LumoActionType a, LumoLocation l, string i = "", string t = "", string s = "")
        {
            action = a;
            location = l;
            itemId = i;
            targetId = t;
            sourceText = s;
        }
    }
}
