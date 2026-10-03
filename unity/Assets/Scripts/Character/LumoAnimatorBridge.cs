using UnityEngine;

namespace MyLumo
{
    public class LumoAnimatorBridge : MonoBehaviour
    {
        public Animator animator;

        static readonly int Speed = Animator.StringToHash("Speed");
        static readonly int Emotion = Animator.StringToHash("Emotion");
        static readonly int Eat = Animator.StringToHash("Eat");
        static readonly int Sleep = Animator.StringToHash("Sleep");
        static readonly int Bathe = Animator.StringToHash("Bathe");
        static readonly int Dance = Animator.StringToHash("Dance");
        static readonly int Dress = Animator.StringToHash("Dress");
        static readonly int Guitar = Animator.StringToHash("Guitar");
        static readonly int Pet = Animator.StringToHash("Pet");
        static readonly int Build = Animator.StringToHash("Build");

        public void SetMoveSpeed(float speed)
        {
            if (animator) animator.SetFloat(Speed, speed);
        }

        public void SetEmotion(LumoEmotion emotion)
        {
            if (animator) animator.SetInteger(Emotion, (int)emotion);
        }

        public void Trigger(LumoActionType action)
        {
            if (!animator) return;

            switch (action)
            {
                case LumoActionType.Eat: animator.SetTrigger(Eat); break;
                case LumoActionType.Sleep: animator.SetTrigger(Sleep); break;
                case LumoActionType.Bathe: animator.SetTrigger(Bathe); break;
                case LumoActionType.Dance: animator.SetTrigger(Dance); break;
                case LumoActionType.Dress: animator.SetTrigger(Dress); break;
                case LumoActionType.PlayGuitar: animator.SetTrigger(Guitar); break;
                case LumoActionType.PetAnimal: animator.SetTrigger(Pet); break;
                case LumoActionType.Build: animator.SetTrigger(Build); break;
            }
        }
    }
}
