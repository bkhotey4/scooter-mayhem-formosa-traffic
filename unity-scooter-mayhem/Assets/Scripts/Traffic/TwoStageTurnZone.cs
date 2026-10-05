using UnityEngine;

namespace ScooterMayhem.Traffic
{
    /// <summary>
    /// TwoStageTurnZone - 機慢車兩段式左轉待轉區與科技執法監控
    /// 設置於十字路口角落，檢查玩家是否停入待轉格；若未依規定待轉而高速鬼切左轉，
    /// 觸發科技執法拍照罰款，除非玩家使出【神之翹孤輪】遮蔽車牌！
    /// </summary>
    public class TwoStageTurnZone : MonoBehaviour
    {
        [Header("Waiting Box Zone")]
        public float boxRadius = 2.2f;
        public float stopSpeedMax = 6.5f; // km/h
        public float dwellTimeToComplete = 0.35f;
        public int rewardScore = 600;

        [Header("Intersection & Smart Camera Enforcement")]
        public float intersectionZ = 0f;
        public float directTurnMinSpeed = 22.0f; // km/h
        public int fineAmount = 300;
        public AudioClip cameraFlashSound;
        public AudioClip chimeSound;

        private float _dwellTimer;
        private bool _completed;
        private float _ticketCooldown;
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
        }

        private void Update()
        {
            if (_playerTransform == null || _playerController == null) return;

            _ticketCooldown = Mathf.Max(0f, _ticketCooldown - Time.deltaTime);

            Vector3 pPos = _playerTransform.position;
            float dx = pPos.x - transform.position.x;
            float dz = pPos.z - transform.position.z;
            bool inBox = (dx * dx + dz * dz) < (boxRadius * boxRadius);

            // 1. Legal Two-Stage Hook Turn Box Compliance
            if (inBox)
            {
                if (_playerController.CurrentSpeedKmh < stopSpeedMax)
                {
                    _dwellTimer += Time.deltaTime;
                    if (_dwellTimer >= dwellTimeToComplete && !_completed)
                    {
                        _completed = true;
                        Game.AchievementSystem.Instance?.AddProgress("HOOK_TURN_MASTER", 1);
                        Debug.Log($"【乖寶寶兩段式待轉】守法模範生！ +{rewardScore} PTS");
                        if (chimeSound != null) AudioSource.PlayClipAtPoint(chimeSound, transform.position);
                        Invoke(nameof(ResetBox), 15f);
                    }
                }
                else
                {
                    _dwellTimer = 0f;
                }
            }
            else
            {
                _dwellTimer = 0f;
            }

            // 2. Illegal Direct Left Turn Violation Check
            bool inIntersection = Mathf.Abs(pPos.z - intersectionZ) < 7.5f && Mathf.Abs(pPos.x) < 4.2f;
            if (inIntersection && _playerController.CurrentSpeedKmh > directTurnMinSpeed && !_playerController.IsCrashed && _ticketCooldown <= 0f)
            {
                bool turningLeft = _playerController.SteerInput > 0.6f;
                if (turningLeft && !_completed)
                {
                    _ticketCooldown = 8.0f;
                    if (_playerController.IsPlateHidden)
                    {
                        Debug.Log("【極限鬼切免待轉・翹孤輪遮牌】！ +1200 PTS");
                        Debug.Log("[玩家語音]：哇哈哈！照不到大牌啦！");
                    }
                    else
                    {
                        Debug.Log($"【科技執法：未依兩段式左轉】 - 扣除小費 ${fineAmount}！");
                        if (cameraFlashSound != null) AudioSource.PlayClipAtPoint(cameraFlashSound, transform.position);
                        Debug.Log("[警察大聲公]：逼逼！未兩段式左轉！開單！");
                    }
                }
            }
        }

        private void ResetBox()
        {
            _completed = false;
            _dwellTimer = 0f;
        }

        private void OnDrawGizmosSelected()
        {
            Gizmos.color = Color.green;
            Gizmos.DrawWireSphere(transform.position, boxRadius);
        }
    }
}
