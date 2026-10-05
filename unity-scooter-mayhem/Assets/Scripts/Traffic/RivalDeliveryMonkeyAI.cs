using UnityEngine;

namespace ScooterMayhem.Traffic
{
    /// <summary>
    /// RivalDeliveryMonkeyAI - 外送員雙開搶單猴子 NPC
    /// 騎著改裝 Many 110、龍頭裝配 3 支智慧型手機架同時接單、無消音管直通排氣管。
    /// 在車道中高速蛇行穿梭，與玩家爭奪訂單與路權！
    /// </summary>
    public class RivalDeliveryMonkeyAI : MonoBehaviour
    {
        [Header("Movement & Weaving")]
        public float forwardSpeed = 13.0f; // ~47 km/h aggressive delivery speed
        public float swayAmplitude = 2.2f;
        public float swayFrequency = 2.5f;
        public float baseLaneX = 2.2f;

        [Header("Audio & Voice Barks")]
        public AudioSource orderAlertAudio;
        public AudioSource engineAudio;
        public AudioClip alertDingClip;
        public float yellCooldown = 12.0f;

        [Header("Combo & Overtake")]
        public float overtakeSpeedThreshold = 38.0f; // km/h
        public float overtakeRadius = 2.8f;
        public int overtakeScore = 800;

        private float _swayTimer;
        private float _currentYellCooldown;
        private bool _dodgeAwarded;
        private Transform _playerTransform;
        private Vehicle.ScooterVehicleController _playerController;

        private static readonly string[] YellBarks = new string[]
        {
            "叮咚！外送新訂單！",
            "這單是我的！閃開啦！",
            "雙開搶單才是財富密碼！",
            "不要擋我外送搶單！"
        };

        private void Start()
        {
            _swayTimer = Random.Range(0f, 5f);
            _currentYellCooldown = Random.Range(2f, 5f);
            
            var playerObj = GameObject.FindWithTag("Player");
            if (playerObj != null)
            {
                _playerTransform = playerObj.transform;
                _playerController = playerObj.GetComponent<Vehicle.ScooterVehicleController>();
            }
        }

        private void Update()
        {
            _swayTimer += Time.deltaTime * swayFrequency;
            _currentYellCooldown -= Time.deltaTime;

            // 1. Weaving forward trajectory
            Vector3 pos = transform.position;
            pos.z += forwardSpeed * Time.deltaTime;
            pos.x = baseLaneX + Mathf.Sin(_swayTimer) * swayAmplitude;

            // Loop track bounds
            if (pos.z > 175f) pos.z = -175f;
            transform.position = pos;

            // Leaning rotation while weaving
            float leanYaw = Mathf.Sin(_swayTimer) * 12.0f;
            transform.rotation = Quaternion.Euler(0f, leanYaw, -leanYaw * 0.7f);

            // 2. Proximity Voice & Alerts
            if (_playerTransform != null)
            {
                float dist = Vector3.Distance(transform.position, _playerTransform.position);

                if (dist < 16f && _currentYellCooldown <= 0f)
                {
                    _currentYellCooldown = yellCooldown;
                    if (orderAlertAudio != null && alertDingClip != null)
                    {
                        orderAlertAudio.PlayOneShot(alertDingClip);
                    }
                    string bark = YellBarks[Random.Range(0, YellBarks.Length)];
                    Debug.Log($"[外送搶單猴子]：{bark}");
                }

                // 3. Close Overtake Combo
                if (!_dodgeAwarded && dist < overtakeRadius && _playerController != null)
                {
                    float playerKmh = _playerController.CurrentSpeedKmh;
                    if (playerKmh > overtakeSpeedThreshold && !_playerController.IsCrashed)
                    {
                        _dodgeAwarded = true;
                        Game.AchievementSystem.Instance?.AddProgress("MONKEY_RACER", 1);
                        Debug.Log($"【猴子敬禮！外送車神超車！】 +{overtakeScore} PTS");
                        Invoke(nameof(ResetDodge), 8f);
                    }
                }
            }
        }

        private void OnCollisionEnter(Collision collision)
        {
            if (collision.gameObject.CompareTag("Player"))
            {
                var pc = collision.gameObject.GetComponent<Vehicle.ScooterVehicleController>();
                if (pc != null)
                {
                    pc.TriggerCrash(9f);
                    Debug.Log("[雙開外送猴子]：互相傷害啦！");
                }
            }
        }

        private void ResetDodge()
        {
            _dodgeAwarded = false;
        }
    }
}
