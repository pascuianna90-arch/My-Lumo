using System;
using System.Collections;
using UnityEngine;
using UnityEngine.AI;

namespace MyLumo
{
    [RequireComponent(typeof(NavMeshAgent))]
    public class LumoController : MonoBehaviour
    {
        public NavMeshAgent agent;
        public LumoAnimatorBridge animationBridge;
        public LumoNeeds needs;
        public LumoInventory inventory;
        public LumoProgression progression;

        public LumoLocation currentLocation = LumoLocation.Home;
        public float interactionDuration = 3.5f;

        public event Action<LumoTask> TaskCompleted;

        void Awake()
        {
            if (!agent) agent = GetComponent<NavMeshAgent>();
        }

        void Update()
        {
            if (animationBridge && agent)
                animationBridge.SetMoveSpeed(agent.velocity.magnitude);
        }

        public IEnumerator ExecuteTask(LumoTask task)
        {
            var anchor = WorldRegistry.Instance
                ? WorldRegistry.Instance.FindFor(task.location, task.action, task.targetId)
                : null;

            if (anchor && agent && agent.isOnNavMesh)
            {
                agent.SetDestination(anchor.Position);

                while (agent.pathPending)
                    yield return null;

                while (agent.remainingDistance > Mathf.Max(agent.stoppingDistance + .08f, .2f))
                    yield return null;

                transform.rotation = anchor.Rotation;
                currentLocation = task.location;
            }
            else if (task.action == LumoActionType.Move)
            {
                currentLocation = task.location;
            }

            if (task.action != LumoActionType.Move && task.action != LumoActionType.None)
            {
                animationBridge?.Trigger(task.action);
                Apply(task);
                yield return new WaitForSeconds(interactionDuration);
            }

            Reward(task);
            TaskCompleted?.Invoke(task);
        }

        void Apply(LumoTask task)
        {
            switch (task.action)
            {
                case LumoActionType.Eat:
                    needs?.AteMeal();
                    break;
                case LumoActionType.Sleep:
                    needs?.Slept();
                    break;
                case LumoActionType.Bathe:
                    needs?.Bathed();
                    break;
                case LumoActionType.Dance:
                    needs?.Danced();
                    break;
                case LumoActionType.PetAnimal:
                    needs?.Socialized();
                    break;
                case LumoActionType.Dress:
                    if (!string.IsNullOrWhiteSpace(task.itemId))
                        inventory?.EquipHat(task.itemId);
                    break;
                case LumoActionType.PlayGuitar:
                    inventory?.Add("guitar");
                    break;
                case LumoActionType.EnterCar:
                    inventory?.Add("car");
                    break;
            }
        }

        void Reward(LumoTask task)
        {
            if (!progression) return;

            int xp = task.action switch
            {
                LumoActionType.Move => 3,
                LumoActionType.Eat => 8,
                LumoActionType.Sleep => 8,
                LumoActionType.Bathe => 8,
                LumoActionType.Dress => 10,
                LumoActionType.Dance => 10,
                LumoActionType.PlayGuitar => 12,
                LumoActionType.PetAnimal => 12,
                LumoActionType.Build => 20,
                _ => 2
            };

            progression.AddExperience(xp);
        }
    }
}
