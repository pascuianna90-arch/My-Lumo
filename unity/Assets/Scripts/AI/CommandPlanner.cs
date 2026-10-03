using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace MyLumo
{
    public static class CommandPlanner
    {
        public static List<LumoTask> Plan(string command)
        {
            var tasks = new List<LumoTask>();
            string s = Normalize(command);

            if (Has(s, "sapka", "kalap", "hat", "cap", "palaria", "oltozz", "dress"))
                tasks.Add(new LumoTask(
                    LumoActionType.Dress,
                    LumoLocation.Wardrobe,
                    Has(s, "piros", "red", "rosu") ? "red_cap" : "cap",
                    "wardrobe",
                    command));

            if (Has(s, "pizza", "egyél", "egyel", "eat", "mananca"))
                tasks.Add(new LumoTask(
                    LumoActionType.Eat,
                    Has(s, "varos", "city", "oras") ? LumoLocation.PizzaShop : LumoLocation.Kitchen,
                    "pizza",
                    "pizza",
                    command));

            if (Has(s, "furdes", "furdeni", "zuhany", "bath", "shower", "baie", "dus"))
                tasks.Add(new LumoTask(
                    LumoActionType.Bathe,
                    LumoLocation.Bathroom,
                    "",
                    "bath",
                    command));

            if (Has(s, "tanc", "dance", "danseaza"))
                tasks.Add(new LumoTask(LumoActionType.Dance, LumoLocation.LivingRoom, "", "dance_spot", command));

            if (Has(s, "gitar", "guitar", "chitara"))
                tasks.Add(new LumoTask(LumoActionType.PlayGuitar, LumoLocation.LivingRoom, "guitar", "guitar_spot", command));

            if (Has(s, "alud", "sleep", "dormi"))
                tasks.Add(new LumoTask(LumoActionType.Sleep, LumoLocation.Bedroom, "", "bed", command));

            if (Has(s, "kutya", "dog", "caine", "baratkozz", "friend"))
                tasks.Add(new LumoTask(LumoActionType.PetAnimal, LumoLocation.Yard, "", "dog", command));

            if (Has(s, "auto", "car", "masina"))
                tasks.Add(new LumoTask(LumoActionType.EnterCar, LumoLocation.Yard, "car", "car", command));

            if (Has(s, "tenger", "beach", "plaja"))
                tasks.Add(new LumoTask(LumoActionType.Move, LumoLocation.Beach, "", "beach_entry", command));
            else if (Has(s, "hegy", "mountain", "munte"))
                tasks.Add(new LumoTask(LumoActionType.Move, LumoLocation.Mountains, "", "mountain_entry", command));
            else if (Has(s, "varos", "city", "oras"))
                tasks.Add(new LumoTask(LumoActionType.Move, LumoLocation.City, "", "city_entry", command));
            else if (Has(s, "haza", "otthon", "home", "acasa"))
                tasks.Add(new LumoTask(LumoActionType.Move, LumoLocation.Home, "", "home_entry", command));

            if (tasks.Count == 0)
                tasks.Add(new LumoTask(LumoActionType.Idle, LumoLocation.Home, "", "", command));

            return tasks;
        }

        static bool Has(string source, params string[] values)
        {
            foreach (var value in values)
                if (source.Contains(Normalize(value)))
                    return true;

            return false;
        }

        static string Normalize(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) return "";

            var decomposed = value.ToLowerInvariant().Normalize(NormalizationForm.FormD);
            var builder = new StringBuilder();

            foreach (char c in decomposed)
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                    builder.Append(c);

            return builder.ToString().Normalize(NormalizationForm.FormC);
        }
    }
}
