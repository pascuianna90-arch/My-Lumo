using System.Collections;
using TMPro;
using UnityEngine;

namespace MyLumo
{
    public class LumoEmotionBubble : MonoBehaviour
    {
        public Transform worldAnchor;
        public CanvasGroup canvasGroup;
        public TMP_Text messageText;
        public float visibleSeconds = 3.2f;
        public float fadeSeconds = 0.25f;

        Coroutine routine;

        void Awake()
        {
            if (canvasGroup) canvasGroup.alpha = 0f;
        }

        void LateUpdate()
        {
            if (!worldAnchor) return;

            transform.position = worldAnchor.position;

            var cam = Camera.main;
            if (cam)
                transform.rotation = Quaternion.LookRotation(transform.position - cam.transform.position);
        }

        public void Show(string message, float duration = -1f)
        {
            if (string.IsNullOrWhiteSpace(message) || !canvasGroup || !messageText) return;

            if (routine != null) StopCoroutine(routine);
            routine = StartCoroutine(ShowRoutine(message, duration > 0f ? duration : visibleSeconds));
        }

        IEnumerator ShowRoutine(string message, float duration)
        {
            messageText.text = message;
            canvasGroup.alpha = 1f;

            yield return new WaitForSeconds(duration);

            float t = 0f;
            while (t < fadeSeconds)
            {
                t += Time.deltaTime;
                canvasGroup.alpha = 1f - Mathf.Clamp01(t / fadeSeconds);
                yield return null;
            }

            canvasGroup.alpha = 0f;
            routine = null;
        }
    }
}
