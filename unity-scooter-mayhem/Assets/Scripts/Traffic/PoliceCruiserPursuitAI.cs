using System;
using UnityEngine;

namespace ScooterMayhem.Traffic
{
    /// <summary>
    /// PoliceCruiserPursuitAI (高速巡邏警車圍捕系統)
    /// Spawns a high-speed police sedan when player reaches Wanted Heat level 2+.
    /// Features:
    /// - Alternating red and blue LED strobe lightbars.
    /// - Dynamic steering and speed tracking along Taiwanese multi-lane streets.
    /// - Evading criteria: Gutter shortcuts, sidewalk narrow alleys, high speed distance, or license plate hiding.
    /// </summary>
    public class PoliceCruiserPursuitAI : MonoBehaviour
    {
        [Header("Pursuit Performance")]
        [SerializeField] private float maxSpeedMs = 26f; // ~94 km/h
        [SerializeField] private float acceleration = 12f;
        [SerializeField] private float steerDamping = 3.5f;

        [Header("Visual Strobes")]
        [SerializeField] private GameObject redStrobeLight;
        [SerializeField] private GameObject blueStrobeLight;
        [SerializeField] private AudioSource sirenAudioSource;

        private float currentSpeed = 0f;
        private bool isPursuing = false;
        private float strobeTimer = 0f;
        private float loseSightTimer = 0f;

        public bool IsPursuing => isPursuing;
        public event Action<string, int> OnPlayerIntercepted;
        public event Action<string, int> OnPursuitEvaded;

        private void Update()
        {
            if (!isPursuing) return;

            float dt = Time.deltaTime;

            // Strobe Flash
            strobeTimer += dt;
            bool strobeState = Mathf.FloorToInt(strobeTimer * 12f) % 2 == 0;
            if (redStrobeLight != null) redStrobeLight.SetActive(strobeState);
            if (blueStrobeLight != null) blueStrobeLight.SetActive(!strobeState);
        }

        public void UpdatePursuit(float dt, Vector3 playerPos, float playerSpeedMs, bool isPlateHidden, bool isPlayerCrashed)
        {
            if (!isPursuing) return;

            Vector3 toPlayer = playerPos - transform.position;
            float dist = toPlayer.magnitude;

            // Lateral steering towards player lane
            Vector3 pos = transform.position;
            pos.x = Mathf.Lerp(pos.x, Mathf.Clamp(playerPos.x, -5.5f, 5.5f), steerDamping * dt);

            // Longitudinal acceleration
            float targetSpeed = Mathf.Min(maxSpeedMs, Mathf.Abs(playerSpeedMs) + 3.8f);
            currentSpeed = Mathf.Lerp(currentSpeed, targetSpeed, 2.0f * dt);
            float dirZ = Mathf.Sign(toPlayer.z == 0 ? 1 : toPlayer.z);
            pos.z += dirZ * currentSpeed * dt;

            transform.position = pos;
            transform.rotation = Quaternion.Euler(0f, dirZ > 0 ? 0f : 180f, 0f);

            // Intercept Player
            if (dist < 2.5f && !isPlayerCrashed)
            {
                OnPlayerIntercepted?.Invoke("【拒檢衝撞警察局巡邏車】扣除外送報酬 $1500！", 1500);
                StopPursuit();
                return;
            }

            // Evasion Check
            bool onSidewalkOrGutter = Mathf.Abs(playerPos.x) > 5.8f;
            bool isEvading = dist > 42f || onSidewalkOrGutter || isPlateHidden;

            if (isEvading)
            {
                loseSightTimer += dt;
                if (loseSightTimer > 4.5f)
                {
                    OnPursuitEvaded?.Invoke("【神級甩尾擺脫警方圍捕！】條子吃灰！", 1500);
                    StopPursuit();
                }
            }
            else
            {
                loseSightTimer = Mathf.Max(0f, loseSightTimer - dt * 0.5f);
            }
        }

        public void StartPursuit(Vector3 playerPos)
        {
            isPursuing = true;
            gameObject.SetActive(true);
            transform.position = new Vector3(playerPos.x, 0f, playerPos.z - 35f);
            currentSpeed = 15f;
            loseSightTimer = 0f;

            if (sirenAudioSource != null && !sirenAudioSource.isPlaying)
            {
                sirenAudioSource.Play();
            }
        }

        public void StopPursuit()
        {
            isPursuing = false;
            gameObject.SetActive(false);

            if (sirenAudioSource != null && sirenAudioSource.isPlaying)
            {
                sirenAudioSource.Stop();
            }
        }
    }
}
