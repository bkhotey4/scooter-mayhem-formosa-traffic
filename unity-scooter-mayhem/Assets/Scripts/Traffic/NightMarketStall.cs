using UnityEngine;

namespace ScooterMayhem.Traffic
{
    public enum NightMarketStallType
    {
        GrilledSausage,   // 炭烤香腸 (附十八仔骰子大碗公與大紅雨傘)
        SweetPotatoBalls  // 現炸黑糖地瓜球 (附大油鍋與酥脆地瓜球)
    }

    /// <summary>
    /// NightMarketStall - 台灣夜市特色行動攤販
    /// 白鐵不鏽鋼推車，擺放於街道人行道旁，提供極限穿梭加分與夜市文化氛圍。
    /// </summary>
    public class NightMarketStall : MonoBehaviour
    {
        [Header("Stall Properties")]
        public NightMarketStallType stallType = NightMarketStallType.GrilledSausage;
        public float grazeDistance = 2.5f;
        public float minSpeedForCombo = 24.0f; // km/h
        public int comboScore = 350;

        [Header("Audio")]
        public AudioSource stallAudio;
        public AudioClip sizzleAudioClip;

        private bool _dodgeAwarded;
        private Transform _playerTransform;
        private Vehicle.ScooterVehicleController _playerController;

        private void Start()
        {
            var playerObj = GameObject.FindWithTag("Player");
            if (playerObj != null)
            {
                _playerTransform = playerObj.transform;
                _playerController = playerObj.GetComponent<Vehicle.ScooterVehicleController>();
            }

            if (stallAudio != null && sizzleAudioClip != null)
            {
                stallAudio.clip = sizzleAudioClip;
                stallAudio.loop = true;
                stallAudio.Play();
            }
        }

        private void Update()
        {
            if (_dodgeAwarded || _playerTransform == null || _playerController == null) return;

            float dist = Vector3.Distance(transform.position, _playerTransform.position);
            if (dist < grazeDistance && _playerController.CurrentSpeedKmh > minSpeedForCombo && !_playerController.IsCrashed)
            {
                _dodgeAwarded = true;
                string stallName = (stallType == NightMarketStallType.GrilledSausage) ? "炭烤香腸攤" : "現炸地瓜球攤";
                Game.AchievementSystem.Instance?.AddProgress("NIGHT_MARKET_DRIFT", 1);
                Debug.Log($"【穿梭夜市{stallName}！不用排隊！】 +{comboScore} PTS");
                Invoke(nameof(ResetDodge), 6f);
            }
        }

        private void OnCollisionEnter(Collision collision)
        {
            if (collision.gameObject.CompareTag("Player"))
            {
                var pc = collision.gameObject.GetComponent<Vehicle.ScooterVehicleController>();
                if (pc != null)
                {
                    pc.TriggerCrash(8f);
                    Debug.Log(stallType == NightMarketStallType.GrilledSausage 
                        ? "[老闆怒吼]：我的香腸骰子都噴飛啦！" 
                        : "[老闆怒吼]：小心我的滾燙地瓜球大油鍋！");
                }
            }
        }

        private void ResetDodge()
        {
            _dodgeAwarded = false;
        }
    }
}
