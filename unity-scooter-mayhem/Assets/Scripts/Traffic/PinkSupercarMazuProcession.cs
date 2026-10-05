using UnityEngine;

namespace ScooterMayhem.Traffic
{
    /// <summary>
    /// PinkSupercarMazuProcession - 白沙屯/大甲媽祖「粉紅超跑」神轎隊伍
    /// 金黃抬轎木桿、標誌性桃粉紅遮雨簾屋頂、橘帽黃衣轎班勇士、旋轉神聖光環。
    /// 以不可預測的靈動步伐在車道快速穿梭，沿途伴隨鑼鼓喧天，提供「鑽轎底」神力保庇！
    /// </summary>
    public class PinkSupercarMazuProcession : MonoBehaviour
    {
        [Header("Procession Movement")]
        public float forwardSpeed = 3.5f;
        public float swayAmplitude = 1.8f;
        public float swayFrequency = 5.0f;
        public float baseLaneX = -1.8f;

        [Header("Holy Halo & Effects")]
        public Transform haloTransform;
        public float haloRotationSpeed = 120.0f;

        [Header("Audio & Gong")]
        public AudioSource gongAudio;
        public AudioClip gongDrumClip;
        public float gongInterval = 3.6f;

        [Header("Blessing Combo (鑽轎底)")]
        public float blessingRadius = 2.8f;
        public float minSpeedForBlessing = 10.0f;
        public int blessingScore = 1500;

        private float _swayTimer;
        private float _currentGongTimer;
        private bool _blessingAwarded;
        private Transform _playerTransform;
        private Vehicle.ScooterVehicleController _playerController;
        private Cargo.BobaLiquidCargoSystem _bobaSystem;

        private void Start()
        {
            _swayTimer = Random.Range(0f, 5f);
            _currentGongTimer = Random.Range(1f, 3f);

            var playerObj = GameObject.FindWithTag("Player");
            if (playerObj != null)
            {
                _playerTransform = playerObj.transform;
                _playerController = playerObj.GetComponent<Vehicle.ScooterVehicleController>();
                _bobaSystem = playerObj.GetComponent<Cargo.BobaLiquidCargoSystem>();
            }
        }

        private void Update()
        {
            _swayTimer += Time.deltaTime * swayFrequency;
            _currentGongTimer -= Time.deltaTime;

            // 1. Marching with high-frequency sway (粉紅超跑極速進香步伐)
            Vector3 pos = transform.position;
            pos.z += forwardSpeed * Time.deltaTime;
            pos.x = baseLaneX + Mathf.Sin(_swayTimer) * swayAmplitude;

            if (pos.z > 175f) pos.z = -175f;
            transform.position = pos;

            // Palanquin tilting and swaying
            float yawTilt = Mathf.Sin(_swayTimer) * 14.0f;
            transform.rotation = Quaternion.Euler(0f, yawTilt, 0f);

            // Rotate Holy Golden Halo
            if (haloTransform != null)
            {
                haloTransform.Rotate(Vector3.up, haloRotationSpeed * Time.deltaTime, Space.Self);
            }

            // 2. Proximity Gong & Drum Audio
            if (_playerTransform != null)
            {
                float dist = Vector3.Distance(transform.position, _playerTransform.position);

                if (dist < 26f && _currentGongTimer <= 0f)
                {
                    _currentGongTimer = gongInterval;
                    if (gongAudio != null && gongDrumClip != null)
                    {
                        gongAudio.PlayOneShot(gongDrumClip);
                    }
                }

                // 3. Passing under or threading palanquin (鑽轎底神力加持)
                if (!_blessingAwarded && dist < blessingRadius && _playerController != null)
                {
                    if (_playerController.CurrentSpeedKmh > minSpeedForBlessing && !_playerController.IsCrashed)
                    {
                        _blessingAwarded = true;
                        Game.AchievementSystem.Instance?.AddProgress("MAZU_BLESSING", 1);
                        Debug.Log($"【粉紅超跑神力加持】媽祖保庇大吉！ +{blessingScore} PTS");
                        Debug.Log("[轎班大聲公]：白沙屯媽祖保庇！鑽轎底大吉大利！");

                        // Heal Boba Tea Seal HP to 100%
                        if (_bobaSystem != null)
                        {
                            _bobaSystem.RestoreSeal(100f);
                        }

                        Invoke(nameof(ResetBlessing), 10f);
                    }
                }
            }
        }

        private void ResetBlessing()
        {
            _blessingAwarded = false;
        }
    }
}
