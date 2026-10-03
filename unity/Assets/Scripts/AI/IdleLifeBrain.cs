using System.Collections;
using UnityEngine;

namespace MyLumo
{
    public class IdleLifeBrain : MonoBehaviour
    {
        public CommandExecutor executor;
        public LumoNeeds needs;
        public float decisionInterval = 12;
        public bool enabledWhenNoCommands = true;

        IEnumerator Start()
        {
            while (true)
            {
                yield return new WaitForSeconds(decisionInterval);

                if (!enabledWhenNoCommands || !executor || executor.IsBusy || !needs)
                    continue;

                if (needs.energy.value < 18)
                    executor.Enqueue("Menj aludni");
                else if (needs.hunger.value < 22)
                    executor.Enqueue("Egyél pizzát");
                else if (needs.hygiene.value < 20)
                    executor.Enqueue("Menj fürdeni");
                else if (needs.social.value < 20)
                    executor.Enqueue("Játssz a kutyával");
                else if (needs.happiness.value < 28)
                    executor.Enqueue("Táncolj");
            }
        }
    }
}
