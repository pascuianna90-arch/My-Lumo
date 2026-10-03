using UnityEngine;

namespace MyLumo
{
    public class SocialTabsController : MonoBehaviour
    {
        public GameObject lumoChatPanel;
        public GameObject communityChatPanel;

        void Start()
        {
            ShowLumoChat();
        }

        public void ShowLumoChat()
        {
            if (lumoChatPanel) lumoChatPanel.SetActive(true);
            if (communityChatPanel) communityChatPanel.SetActive(false);
        }

        public void ShowCommunityChat()
        {
            if (lumoChatPanel) lumoChatPanel.SetActive(false);
            if (communityChatPanel) communityChatPanel.SetActive(true);
        }
    }
}
